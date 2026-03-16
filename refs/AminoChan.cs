using UnityEngine;
using System.Collections.Generic;

public enum AttackType
{
    Direct,
    Shotgun,
    Mortar
}

[System.Serializable]
public class BuffInfo
{
    public string buffType;   // 버프 종류 (ID)
    public float buffAmount;  // 버프 수치
}
[CreateAssetMenu(fileName = "New Aminochan", menuName = "Unit/New Aminochan")]
public class AminoChan : ScriptableObject
{
    [Header("Basic Info")]
    public string turretName;       // 타워 이름
    public int cost;                // 배치 비용
    public GameObject TurretPrefab; // 배치 시 사용될 프리팹

    [Header("Combat Stats")]
    public float maxHealth;         // 체력
    public float attackDamage;      // 공격력
    public float healAmount;        // 치유력
    public float defense;           // 방어력

    [Header("Attack Config")]
    public AttackType attackType;   // 공격 종류
    public GameObject attackPrefab; // 공격 프리팹

    [Header("Projectile & Magazine")]
    public float attackAngle;         // 사격각
    [Range(0, 360)] public float attackRange;       // 사거리
    public float projectileSpeed;   // 탄속
    public float flightTime;        // 비행 시간
    public int magazineSize;        // 장탄수
    public int burstCount;          // 점사수
    public float reloadTime;        // 장전 시간

    [Header("Knockback")]
    public float knockbackForce;    // 넉백 힘

    [Header("Critical")]
    [Range(0, 1)] public float critChance;  // 치명타 확률
    public float critMultiplier;            // 치명타 배율

    [Header("Splash Attack")]
    public bool isSplashAttack;     // 범위공격 여부
    public float splashRadius;      // 범위공격 반지름

    [Header("Area Attack")]
    public bool isAreaEffect;      // 장판공격 여부
    public string effectTypeId;     // 종류 ID
    public int damagePerTick;       // 틱당 데미지
    public float areaAttackDelay;  // 장판 공격 딜레이
    public float areaRadius;       // 장판 반지름
    public float areaDuration;     // 지속 시간
    [Range(0, 1)]
    public float slowPercent; // 슬로우 비율

    [Header("Resource Bonus")]
    public float atpDropBonusRate; // 적 처치 시 지급되는 ATP 증가 비율

    [Header("Buff & SFX")]
    public List<Vector2Int> buffPattern; // 버프 패턴
    public List<BuffInfo> buffList;      // 버프 리스트 (직렬화
    public List<string> sfxList;         // 효과음 리스트
}