[System.Serializable]
public class AminoCard
{
    public AminoChan originalAminoChan; // 설계도 참조
    public int level = 1;      // 합성으로 올릴 레벨
    public ItemData[] itemSlots = new ItemData[2]; // 아이템 슬롯 2개

    // 가방 무게 계산 (기본 무게 + 아이템 무게)
    public int GetTotalWeight()
    {
        // AminoChan에 무게 변수를 추가했다고 가정(TODO)!
        int weight = 10; // 예시 기본값
        foreach (var item in itemSlots) if (item != null) weight += item.weight;
        return weight;
    }

    // 인게임 유닛에게 전달할 최종 스탯 뭉치 생성 (아이템 효과 합산 등)
    public CardStats GetCardStats()
    {
        CardStats stats = new CardStats();
        
        // 1. AminoChan의 기본 스탯 복사
        stats.turretName = originalAminoChan.turretName;
        stats.deploymentCost = originalAminoChan.cost;
        stats.totalWeight = GetTotalWeight();

        stats.maxHealth = originalAminoChan.maxHealth;
        stats.attackDamage = originalAminoChan.attackDamage;
        stats.healAmount = originalAminoChan.healAmount;
        stats.defense = originalAminoChan.defense;
        
        // 관통 및 넉백 (AminoChan에 관통력이 없다면 기본 1로 설정, 현재 AminoChan에 없어서 기본값)
        stats.maxPenetration = 1; // TODO: 필요시 AminoChan에 maxPenetration 추가
        stats.knockbackForce = originalAminoChan.knockbackForce;

        stats.attackType = originalAminoChan.attackType;
        stats.projectilePrefab = originalAminoChan.attackPrefab; // 프리팹 연동!
        stats.range = originalAminoChan.attackRange;

        stats.critChance = originalAminoChan.critChance;
        stats.critMultiplier = originalAminoChan.critMultiplier;
        stats.projectileSpeed = originalAminoChan.projectileSpeed;
        stats.flightTime = originalAminoChan.flightTime;
        stats.magazineSize = originalAminoChan.magazineSize;
        stats.burstCount = originalAminoChan.burstCount;
        stats.reloadTime = originalAminoChan.reloadTime;

        stats.hasSplash = originalAminoChan.isSplashAttack;
        stats.splashRadius = originalAminoChan.splashRadius;
        stats.hasAreaEffect = originalAminoChan.isAreaEffect;
        stats.slowAmount = originalAminoChan.slowPercent;
        
        // 장판 추가 스탯
        stats.effectTypeId = originalAminoChan.effectTypeId;
        stats.damagePerTick = originalAminoChan.damagePerTick;
        stats.areaAttackDelay = originalAminoChan.areaAttackDelay;
        stats.areaRadius = originalAminoChan.areaRadius;
        stats.areaDuration = originalAminoChan.areaDuration;

        stats.atpDropBonusRate = originalAminoChan.atpDropBonusRate;

        stats.buffPattern = new System.Collections.Generic.List<UnityEngine.Vector2Int>(originalAminoChan.buffPattern);
        stats.buffList = new System.Collections.Generic.List<BuffInfo>(originalAminoChan.buffList);

        // 2. 합성 레벨 배율 (예시로 단순 덧셈)
        float levelMultiplier = 1f + (level - 1) * 0.1f;
        stats.maxHealth *= levelMultiplier;
        stats.attackDamage *= levelMultiplier;

        // 3. (TODO) 아이템 능력치 합산 로직 (itemSlots 순회하여 스탯 증가)
        // foreach (var item in itemSlots) { ApplyItemModifiers(stats, item); }

        return stats;
    }
}