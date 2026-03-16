using UnityEngine;
using System.Collections.Generic;

public class BuffManager : MonoBehaviour
{
    public static BuffManager Instance;

    void Awake()
    {
        if (Instance == null) Instance = this;
        else Destroy(gameObject);
    }

    // 모든 타일과 유닛의 버프 상태를 처음부터 다시 계산합니다.
    public void RecalculateAll()
    {
        // 1. 모든 타일의 버프 스택 및 유닛 스탯 초기화
        foreach (GameObject tileGO in GridManager.Instance.GetAllTiles())
        {
            if (tileGO == null) continue;

            HexTile tile = tileGO.GetComponent<HexTile>();
            tile.ResetBuffStacks(); // 타일에 쌓인 버프 정보 초기화

            if (tile.HasTurret())
            {
                // 타일에 있는 아미노쨩의 스탯을 기본값으로 되돌립니다.
                tile.placedTurret.GetComponent<AminoTurret>().ResetStats();
            }
        }

        // 2. 각 유닛의 buffPattern을 바탕으로 주변 타일에 버프 전파
        foreach (AminoTurret turret in UnitManager.Instance.placedUnits)
        {
            ApplyTurretBuffs(turret);
        }

        // 3. 버프 누적이 끝난 후, 모든 유닛의 최종 CardStats 계산 및 타일 색상 갱신
        foreach (AminoTurret turret in UnitManager.Instance.placedUnits)
        {
            turret.RecalculateCurrentStats(); // 최종 시너지 합산
        }

        foreach (GameObject tileGO in GridManager.Instance.GetAllTiles())
        {
            if (tileGO != null) tileGO.GetComponent<HexTile>().UpdateColor(); // 시각적 피드백
        }

        Debug.Log("--- 모든 아미노산 시너지 재계산 완료! ---");
    }

    // 개별 유닛이 가진 패턴대로 버프를 뿌리는 로직
    private void ApplyTurretBuffs(AminoTurret turret)
    {
        if (turret.myTile == null) return;
        Vector2Int myCoords = turret.myTile.hexCoords; // 내 육각형 좌표

        // CardStats (Base Stats)에 정의된 육각형 상대 좌표 패턴을 순회합니다.
        if (turret.baseStats.buffPattern == null || turret.baseStats.buffList == null) return;
        
        foreach (Vector2Int offset in turret.baseStats.buffPattern)
        {
            Vector2Int targetCoords = myCoords + offset;
            GameObject targetTileGO = GridManager.Instance.GetTileAt(targetCoords);

            if (targetTileGO != null)
            {
                HexTile targetTile = targetTileGO.GetComponent<HexTile>();
                // 해당 타일에 버프 리스트를 전달하여 누적시킵니다.
                targetTile.AddBuffPayload(turret.baseStats.buffList);
            }
        }
    }
}