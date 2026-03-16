using UnityEngine;
using System.Collections.Generic;

[System.Serializable]
public class CardStats
{
    [Header("Basic Info")]
    public string turretName;       // 이름은 보여줘야죠!
    public int deploymentCost;      // 인게임 배치 비용
    public int totalWeight;         // 가방 무게 (카드 + 아이템 합산)

    [Header("Combat Stats")]
    public float maxHealth;         // 체력
    public float attackDamage;      // 공격력
    public float healAmount;        // 치유력
    public float defense;           // 방어력
    public int maxPenetration;      // 관통력
    public float knockbackForce;    // 넉백 힘

    [Header("Attack Config")]
    public AttackType attackType;   // 공격 방식 (직사, 산탄, 곡사)
    public GameObject projectilePrefab; // 발사체 프리팹 (추가됨!)
    public float range;             // 사거리

    [Header("Critical & Technical")]
    public float critChance;        // 치명타 확률
    public float critMultiplier;    // 치명타 배율
    public float projectileSpeed;   // 탄속 (아이템 영향 가능성)
    public float flightTime;        // 비행 시간
    public int magazineSize;        // 장탄수
    public int burstCount;          // 점사수
    public float reloadTime;        // 장전 시간

    [Header("Special Effects")]
    public bool hasSplash;          // 스플래시 여부
    public float splashRadius;      // 스플래시 범위
    public bool hasAreaEffect;      // 장판 효과 여부
    public float slowAmount;        // 슬로우 배율
    public string effectTypeId;     // 장판 종류 ID (기존 AminoChan 연동)
    public int damagePerTick;       // 장판 틱 누적
    public float areaAttackDelay;   // 장판 딜레이
    public float areaRadius;        // 장판 반지름
    public float areaDuration;      // 장판 지속 시간
    
    [Header("Resource Bonus")]
    public float atpDropBonusRate;  // ATP 드랍 보너스

    [Header("Synergy & Buff")]
    // 버프 패턴과 리스트는 시너지 확인을 위해 꼭 필요해요!
    public List<Vector2Int> buffPattern;
    public List<BuffInfo> buffList;
}