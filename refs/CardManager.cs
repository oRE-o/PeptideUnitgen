using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class CardManager : MonoBehaviour
{
    public static CardManager Instance;

    [Header("덱 설정")]
    public List<AminoCard> deck = new List<AminoCard>(); // 현재 들고 있는 카드들
    private Dictionary<AminoCard, float> cooldowns = new Dictionary<AminoCard, float>();

    void Awake() => Instance = this;

    // 코돈(카드) 사용 시도
    public bool TryUseCard(AminoCard card, HexTile targetTile, int direction)
    {
        // 1. 쿨타임 체크
        if (cooldowns.ContainsKey(card) && cooldowns[card] > 0) return false;

        // 2. 비용(ATP) 체크 (AminoChan의 비용 사용)
        if (!ResourceManager.Instance.SpendATP(card.originalAminoChan.cost)) return false;

        // 3. 배치 유효성 체크 및 소환
        if (UnitManager.Instance.CanPlaceUnit(targetTile))
        {
            UnitManager.Instance.SpawnUnit(card, targetTile, direction);
            
            // TODO: AminoChan 구조에 cooldown 속성이 추가된다면 그걸 써야합니다.
            // 일단은 고정 쿨타임(1초)을 부여합니다.
            StartCoroutine(StartCooldown(card, 1.0f)); 
            return true;
        }

        return false;
    }

    IEnumerator StartCooldown(AminoCard card, float cooldownAmount)
    {
        cooldowns[card] = cooldownAmount;
        while (cooldowns[card] > 0)
        {
            cooldowns[card] -= Time.deltaTime;
            yield return null;
        }
    }
}
