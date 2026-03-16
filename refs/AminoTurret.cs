using UnityEngine;
using System.Collections.Generic;

#if UNITY_EDITOR
using UnityEditor;
#endif

public class AminoTurret : MonoBehaviour
{
    [Header("설계도 연결 (Legacy 주의)")]
    // public TurretData turretData; // 삭제됨: 이제 CardStats 사용!
    
    // --- 런타임 스탯 ---
    public CardStats baseStats { get; private set; }    // 아이템 적용된 기본 능력치
    public CardStats currentStats { get; private set; } // 버프/시너지가 적용된 최종 능력치

    [Header("연결")]
    public Transform turretBody;
    public Transform firePoint;
    public Transform directionIndicator;
    public GameObject muzzleFlashPrefab;
    
    // 체력은 현재 체력만 따로 관리
    private float currentHealth;

    // --- 버프 배율 ---
    private float totalAttackSpeedMultiplier = 1f;
    private float totalAttackDamageMultiplier = 1f;
    private float totalAttackRangeMultiplier = 1f;

    private Enemy targetEnemy;
    private float fireCountdown = 0f;
    public HexTile myTile;

    [HideInInspector]
    public int placementDirectionIndex = 0;

    void OnDestroy()
    {
        if (UnitManager.Instance != null)
        {
            UnitManager.Instance.RemoveUnit(this);
        }
        else if (GameManager.Instance != null)
        {
            GameManager.Instance.allTurretsOnMap.Remove(this);
            GameManager.Instance.RecalculateAllBuffs(); // Legacy compatibility
        }
    }

    // ★ 새로운 초기화 함수 (CardManager / UnitManager가 호출)
    public void Initialize(AminoCard card, HexTile tile, int directionIndex)
    {
        myTile = tile;
        placementDirectionIndex = directionIndex;

        // 1. 카드의 기본+아이템 합산 스탯을 받아서 Base로 저장
        baseStats = card.GetCardStats();
        
        // 2. 현재 스탯 구조체 초기화
        currentStats = new CardStats();
        
        // 3. 체력 초기화
        currentHealth = baseStats.maxHealth;

        if (directionIndicator != null)
        {
            float placementAngleY = directionIndex * 60f;
            directionIndicator.rotation = Quaternion.Euler(0, placementAngleY, 0) * Quaternion.Euler(90f, 0, 0);
        }

        // 4. 버프 적용 전(1.0배율) 상태로 currentStats 세팅
        ResetStats();

        InvokeRepeating("UpdateTarget", 0f, 0.2f);
    }
    
    // Legacy Setup 대비용 (호환성 목적)
    public void Setup(TurretData data, HexTile tile, int directionIndex)
    {
        Debug.LogWarning("구버전 Setup 함수 호출됨!");
        myTile = tile;
        placementDirectionIndex = directionIndex;
        if (GameManager.Instance != null) GameManager.Instance.allTurretsOnMap.Add(this);
        InvokeRepeating("UpdateTarget", 0f, 0.2f);
    }

    // BuffManager가 부를 함수: 배율을 1로 돌리고 Base -> Current 복사
    public void ResetStats()
    {
        totalAttackSpeedMultiplier = 1f;
        totalAttackDamageMultiplier = 1f;
        totalAttackRangeMultiplier = 1f;
        
        RecalculateCurrentStats();
    }

    // 더 이상 터렛이 스스로 쏘지 않음. BuffManager가 할꺼임!
    // public void ApplyBuffsToNeighbors() { ... } // 삭제

    // HexTile이 전달해준 버프를 쌓는 곳
    public void ReceiveBuff(BuffType buffType, float amount)
    {
        switch (buffType)
        {
            case BuffType.AttackSpeed: totalAttackSpeedMultiplier *= amount; break;
            case BuffType.AttackDamage: totalAttackDamageMultiplier *= amount; break;
            case BuffType.AttackRange: totalAttackRangeMultiplier *= amount; break;
        }
    }

    // BuffManager가 배율 누적이 끝난 후 마지막에 호출하는 함수
    public void RecalculateCurrentStats()
    {
        if (baseStats == null) return;
        
        // Base -> Current 얕은 복사본을 직접 합산
        currentStats.turretName = baseStats.turretName;
        currentStats.attackType = baseStats.attackType;
        currentStats.maxPenetration = baseStats.maxPenetration;
        currentStats.knockbackForce = baseStats.knockbackForce;
        
        // 발사체 특수 스탯 넘기기
        currentStats.hasSplash = baseStats.hasSplash;
        currentStats.splashRadius = baseStats.splashRadius;
        currentStats.hasAreaEffect = baseStats.hasAreaEffect;
        currentStats.slowAmount = baseStats.slowAmount;
        currentStats.effectTypeId = baseStats.effectTypeId;
        currentStats.damagePerTick = baseStats.damagePerTick;
        currentStats.areaAttackDelay = baseStats.areaAttackDelay;
        currentStats.areaRadius = baseStats.areaRadius;
        currentStats.areaDuration = baseStats.areaDuration;
        currentStats.atpDropBonusRate = baseStats.atpDropBonusRate;
        
        // 발사체/무기 상세
        currentStats.critChance = baseStats.critChance;
        currentStats.critMultiplier = baseStats.critMultiplier;
        currentStats.projectileSpeed = baseStats.projectileSpeed;
        currentStats.flightTime = baseStats.flightTime;
        currentStats.magazineSize = baseStats.magazineSize;
        currentStats.burstCount = baseStats.burstCount;

        // 배율(Buff) 적용 파트!
        currentStats.attackDamage = baseStats.attackDamage * totalAttackDamageMultiplier;
        currentStats.range = baseStats.range * totalAttackRangeMultiplier;
        // 쿨타임(reloadTime)은 공격속도가 오르면 짧아져야 함 -> 나누기 적용
        currentStats.reloadTime = baseStats.reloadTime / totalAttackSpeedMultiplier;
    }

    void UpdateTarget()
    {
        if (currentStats == null) return;
        
        Enemy nearestEnemy = null;
        float shortestDistance = Mathf.Infinity;

        Vector3 scanPosition = transform.position;
        Quaternion placementRotation = Quaternion.Euler(0, placementDirectionIndex * 60f, 0);
        Vector3 fixedForwardDirection = placementRotation * Vector3.forward;

        // currentStats.range 사용
        Collider[] colliders = Physics.OverlapSphere(scanPosition, currentStats.range);

        foreach (Collider collider in colliders)
        {
            Enemy enemy = collider.GetComponentInParent<Enemy>();
            if (enemy != null)
            {
                Vector3 directionToEnemy = (enemy.transform.position - scanPosition).normalized;
                // AminoChan에 attackAngle이 없다면 임시로 고정값 (예: 60도) 또는 구조체 확장 필요
                // 여기선 임시로 120도로 두거나, AminoChan에 사격각 추가 필요
                float angle = 120f; 
                float angleToEnemy = Vector3.Angle(fixedForwardDirection, directionToEnemy);

                if (angleToEnemy <= angle / 2)
                {
                    float distance = Vector3.Distance(scanPosition, enemy.transform.position);
                    if (distance < shortestDistance)
                    {
                        shortestDistance = distance;
                        nearestEnemy = enemy;
                    }
                }
            }
        }
        targetEnemy = nearestEnemy;
    }

    void Update()
    {
        if (Core.Instance != null && Core.Instance.transportState == Core.SkillState.Active) return;
        if (targetEnemy == null || currentStats == null) return;

        if (turretBody != null)
        {
            Transform aimTarget = targetEnemy.aimPoint != null ? targetEnemy.aimPoint : targetEnemy.transform;
            Vector3 targetLookPosition = new Vector3(aimTarget.position.x, turretBody.position.y, aimTarget.position.z);
            turretBody.LookAt(targetLookPosition);
        }

        fireCountdown -= Time.deltaTime;
        if (fireCountdown <= 0f)
        {
            Shoot();
            fireCountdown = currentStats.reloadTime;
        }
    }

    void Shoot()
    {
        if (targetEnemy == null || currentStats == null) return;
        
        // ★ TurretData의 사운드 이름 대신 임시 처리 혹은 AminoChan으로 이관 필요
        // if (SoundManager.Instance != null && !string.IsNullOrEmpty(turretData.launchSoundName))
        // {
        //     SoundManager.Instance.PlaySFX(turretData.launchSoundName);
        // }
        
        switch (currentStats.attackType)
        {
            case AttackType.Direct: Shoot_Direct(); break;
            case AttackType.Shotgun: Shoot_Shotgun(); break;
            case AttackType.Mortar: Shoot_Mortar(); break;
        }
    }

    void Shoot_Direct()
    {
        Vector3 firePosition = firePoint != null ? firePoint.position : (turretBody != null ? turretBody.position : transform.position);
        Transform aimTarget = targetEnemy.aimPoint != null ? targetEnemy.aimPoint : targetEnemy.transform;
        Vector3 direction = (aimTarget.position - firePosition).normalized;

        if (muzzleFlashPrefab != null)
        {
            GameObject flash = Instantiate(muzzleFlashPrefab, firePosition, Quaternion.LookRotation(direction));
            Destroy(flash, 1.0f);
        }

        // TODO: (임시) turretData.projectilePrefab에서 빼오던 것을 AminoChan 등으로 이관 필요
        // 현재는 아쉽게도 TurretData 의존성을 완전히 못 자르므로 터렛 원본을 가져오거나 prefab 참조 구조 개선 필요.
        // 일단은 GetCardStats 내부에서 Prefab을 참조할 수 있게 한다면 베스트지만, 지금은 baseStats에 prefab 연결이 없음.
        // AminoChan에서 직통으로 프리팹을 받을 수 있도록 우회 필요. (현재 TurretData.projectilePrefab 참조중)
        
        GameObject projectilePrefabToUse = baseStats.projectilePrefab ?? turretData.projectilePrefab; // Fallback
        
        if (projectilePrefabToUse != null)
        {
            GameObject projectileGO = Instantiate(projectilePrefabToUse, firePosition, Quaternion.LookRotation(direction));
            AminoProjectile projectile = projectileGO.GetComponent<AminoProjectile>();
            if (projectile != null)
            {
                projectile.SetData(direction, currentStats.attackDamage, currentStats.maxPenetration, currentStats);
            }
        }
    }

    void Shoot_Shotgun()
    {
        Vector3 firePosition = firePoint != null ? firePoint.position : (turretBody != null ? turretBody.position : transform.position);
        Transform aimTarget = targetEnemy.aimPoint != null ? targetEnemy.aimPoint : targetEnemy.transform;

        Vector3 centerDirection = (aimTarget.position - firePosition).normalized;
        Quaternion centerRotation = Quaternion.LookRotation(centerDirection);

        if (muzzleFlashPrefab != null)
        {
            GameObject flash = Instantiate(muzzleFlashPrefab, firePosition, centerRotation);
            Destroy(flash, 1.0f);
        }

        int count = currentStats.burstCount > 0 ? currentStats.burstCount : 1; // 임시: 샷건 탄환 수
        float maxAngle = 45f; // 임시: 샷건 분산각 
        float minAngle = maxAngle * 0.2f;

        GameObject projectilePrefabToUse = baseStats.projectilePrefab ?? turretData.projectilePrefab;

        for (int i = 0; i < count; i++)
        {
            float currentAngle = 0f;
            if (i > 0)
            {
                float randomSpread = Random.Range(minAngle, maxAngle);
                float sign = (Random.value > 0.5f) ? 1f : -1f;
                currentAngle = randomSpread * sign;
            }

            Quaternion spreadRotation = Quaternion.Euler(0, currentAngle, 0);
            Quaternion finalRotation = centerRotation * spreadRotation;
            Vector3 finalDirection = finalRotation * Vector3.forward;

            if (projectilePrefabToUse != null)
            {
                GameObject projectileGO = Instantiate(projectilePrefabToUse, firePosition, finalRotation);

                GelProjectile gel = projectileGO.GetComponent<GelProjectile>();
                if (gel != null)
                {
                    float dist = Vector3.Distance(firePosition, aimTarget.position);
                    Vector3 landingPos = firePosition + (finalDirection * dist);

                    gel.Launch(landingPos, currentStats.attackDamage, currentStats.maxPenetration, currentStats);
                }
                else
                {
                    AminoProjectile aminoProj = projectileGO.GetComponent<AminoProjectile>();
                    if (aminoProj != null)
                    {
                        aminoProj.SetData(finalDirection, currentStats.attackDamage, currentStats.maxPenetration, currentStats);
                    }
                }
            }
        }
    }

    void Shoot_Mortar()
    {
        Vector3 firePosition = firePoint != null ? firePoint.position : transform.position;

        if (muzzleFlashPrefab != null)
        {
            GameObject flash = Instantiate(muzzleFlashPrefab, firePosition, turretBody != null ? turretBody.rotation : transform.rotation);
            Destroy(flash, 1.0f);
        }

        GameObject projectilePrefabToUse = baseStats.projectilePrefab ?? turretData.projectilePrefab;

        if (projectilePrefabToUse != null)
        {
            GameObject projectileGO = Instantiate(projectilePrefabToUse, firePosition, Quaternion.identity);
            MortarProjectile projectile = projectileGO.GetComponent<MortarProjectile>();

            if (projectile != null)
            {
                Transform aimTarget = targetEnemy.aimPoint != null ? targetEnemy.aimPoint : targetEnemy.transform;
                Vector3 targetPos = aimTarget.position;

                projectile.SetTarget(targetPos, currentStats.attackDamage, currentStats);
            }
        }
    }

    public void TakeDamage(int damage)
    {
        currentHealth -= damage;
        if (currentHealth <= 0) Die();
    }

    private void Die()
    {
        if (myTile != null)
        {
            myTile.SetPlacedTurret(null);
            myTile.isBuildable = true;
            myTile.UpdateColor();
        }
        Destroy(gameObject);
    }

#if UNITY_EDITOR
    private void OnDrawGizmosSelected()
    {
        if (currentStats == null) return;
        float angle = 120f;
        
        Gizmos.color = Color.white;
        Gizmos.DrawWireSphere(transform.position, currentStats.range);

        Handles.color = new Color(1f, 1f, 0f, 0.1f);
        Quaternion placementRotation = Quaternion.Euler(0, placementDirectionIndex * 60f, 0);
        Vector3 fixedForwardDirection = placementRotation * Vector3.forward;
        Vector3 position = transform.position;
        Handles.DrawSolidArc(position, Vector3.up, Quaternion.AngleAxis(-angle / 2, Vector3.up) * fixedForwardDirection, angle, currentStats.range);

        Gizmos.color = Color.red;
        Gizmos.DrawRay(position, fixedForwardDirection * currentStats.range);
    }
#endif
}