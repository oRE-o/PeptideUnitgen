import { useAppStore } from './store';

type Translations = {
  [key: string]: {
    en: string;
    ko: string;
    ja: string;
  };
};

export const translations: Translations = {
  // Navigation
  "nav.title": { en: "Peptide", ko: "Peptide", ja: "Peptide" },
  "nav.characters": { en: "Characters", ko: "캐릭터", ja: "キャラクター" },
  "nav.items": { en: "Items", ko: "아이템", ja: "アイテム" },
  "nav.lab": { en: "Laboratory", ko: "연구소", ja: "研究所" },
  "nav.addUnit": { en: "Add Character", ko: "캐릭터 추가", ja: "キャラクター追加" },
  "nav.addItem": { en: "Add Item", ko: "아이템 추가", ja: "アイテム追加" },
  "nav.export": { en: "Export Data", ko: "데이터 내보내기", ja: "データ出力" },
  "nav.import": { en: "Import Data", ko: "데이터 불러오기", ja: "データ読み込み" },
  "nav.successLoad": { en: "Preset loaded successfully.", ko: "프리셋을 성공적으로 불러왔습니다.", ja: "プリセットの読み込みに成功しました。" },
  "nav.failLoad": { en: "Failed to load preset. Invalid format.", ko: "프리셋 불러오기에 실패했습니다. 잘못된 형식입니다.", ja: "プリセットの読み込みに失敗しました。無効な形式です。" },
  "nav.errorLoad": { en: "An error occurred while loading the file.", ko: "파일을 불러오는 중 오류가 발생했습니다.", ja: "ファイルの読み込み中にエラーが発生しました。" },

  // MainView
  "roster.title": { en: "Character Collection", ko: "캐릭터 콜렉션", ja: "キャラクターコレクション" },
  "roster.subtitle": { en: "Manage and view your created characters.", ko: "생성된 캐릭터를 확인하고 관리하세요.", ja: "作成したキャラクターを確認・管理します。" },
  "roster.emptyTitle": { en: "No characters found.", ko: "캐릭터가 없습니다.", ja: "キャラクターがいません。" },
  "roster.emptySub": { en: "Create a new character to get started.", ko: "새 캐릭터를 생성하여 시작하세요.", ja: "新しいキャラクターを作成して始めましょう。" },
  "roster.btnUnit": { en: "Create Character", ko: "캐릭터 생성", ja: "キャラクター作成" },

  // ItemList
  "itemlist.title": { en: "Items & Relics", ko: "아이템 & 유물", ja: "アイテム＆遺物" },
  "itemlist.subtitle": { en: "Manage your crafted items and equipment.", ko: "제작한 아이템과 장비를 관리하세요.", ja: "作成したアイテムと装備を管理します。" },
  "itemlist.emptyTitle": { en: "Inventory is empty.", ko: "인벤토리가 비어 있습니다.", ja: "インベントリが空です。" },
  "itemlist.emptySub": { en: "Craft a new item to get started.", ko: "새 아이템을 제작하여 시작하세요.", ja: "新しいアイテムを作成して始めましょう。" },
  "itemlist.btnItem": { en: "Craft Item", ko: "아이템 제작", ja: "アイテム作成" },
  "itemlist.buffs": { en: "Buffs", ko: "버프", ja: "バフ" },

  // LabView
  "lab.title": { en: "Laboratory", ko: "연구소", ja: "研究所" },
  "lab.subtitle": { en: "Simulate character stats with equipped items.", ko: "장착된 아이템에 따른 캐릭터 스탯을 시뮬레이션합니다.", ja: "装備アイテムによるキャラクターステータスをシミュレーションします。" },
  "lab.subject": { en: "Subject", ko: "대상", ja: "対象" },
  "lab.selectStudent": { en: "Select Subject", ko: "대상 선택", ja: "対象を選択" },
  "lab.equip": { en: "Equipment", ko: "장비", ja: "装備" },
  "lab.equipItem": { en: "Equip Item...", ko: "아이템 장착...", ja: "アイテムを装備..." },
  "lab.noSubject": { en: "No Subject Selected", ko: "대상을 선택하지 않았습니다", ja: "対象が選択されていません" },
  "lab.noSubjectSub": { en: "Please select a character from the left panel to begin.", ko: "왼쪽 패널에서 캐릭터를 선택하여 시작하세요.", ja: "左側のパネルからキャラクターを選択して始めてください。" },
  "lab.projStats": { en: "Projected Stats", ko: "예상 스탯", ja: "予想ステータス" },
  "lab.passive": { en: "Passive Effects", ko: "패시브 효과", ja: "パッシブ効果" },
  "lab.buffRange": { en: "Buff Area of Effect", ko: "버프 적용 범위", ja: "バフ適用範囲" },
  "lab.hexLegend": { en: "Blue = Self, Yellow = Area of Effect", ko: "파랑 = 자신, 노랑 = 효과 범위", ja: "青 = 自分、黄 = 効果範囲" },
  "lab.modalSub": { en: "Select Subject", ko: "대상 선택", ja: "対象を選択" },
  "lab.modalEq": { en: "Select Equipment", ko: "장비 선택", ja: "装備を選択" },
  "lab.searchChar": { en: "Search characters...", ko: "캐릭터 검색...", ja: "キャラクターを検索..." },
  "lab.searchItem": { en: "Search items...", ko: "아이템 검색...", ja: "アイテムを検索..." },

  // Edit Unit
  "editu.titleAdd": { en: "Create New Character", ko: "새 캐릭터 생성", ja: "新規キャラクター作成" },
  "editu.titleEdit": { en: "Edit Character", ko: "캐릭터 편집", ja: "キャラクター編集" },
  "editu.upload": { en: "Upload Image", ko: "이미지 업로드", ja: "画像アップロード" },
  "editu.tabBasic": { en: "Basic Info", ko: "기본 정보", ja: "基本情報" },
  "editu.tabCombat": { en: "Combat Stats", ko: "전투 수치", ja: "戦闘ステータス" },
  "editu.tabAttack": { en: "Attack Config", ko: "공격 설정", ja: "攻撃設定" },
  "editu.tabSpecial": { en: "Special Effects", ko: "특수 효과", ja: "特殊効果" },
  "editu.tabBuffs": { en: "Aura Buffs", ko: "오라 버프", ja: "オーラバフ" },
  "editu.btnDelete": { en: "Delete", ko: "삭제", ja: "削除" },
  "editu.btnSave": { en: "Save", ko: "저장", ja: "保存" },
  "editu.btnUpdate": { en: "Update", ko: "업데이트", ja: "更新" },
  "editu.confirmDel": { en: "Are you sure you want to delete this character?", ko: "이 캐릭터를 정말 삭제하시겠습니까?", ja: "このキャラクターを本当に削除しますか？" },

  // Edit Item
  "editi.titleAdd": { en: "Craft New Item", ko: "새 아이템 제작", ja: "新規アイテム作成" },
  "editi.titleEdit": { en: "Edit Item", ko: "아이템 편집", ja: "アイテム編集" },
  "editi.buffPattern": { en: "Buff Pattern", ko: "버프 패턴", ja: "バフパターン" },
  "editi.deleteItem": { en: "Delete Item", ko: "아이템 삭제", ja: "アイテム削除" },
  "editi.saveItem": { en: "Save Item", ko: "아이템 저장", ja: "アイテム保存" },
  "editi.confirmDelItem": { en: "Are you sure you want to delete this item?", ko: "이 아이템을 정말 삭제하시겠습니까?", ja: "このアイテムを本当に削除しますか？" },
  "editi.btnAddBuff": { en: "Add Buff", ko: "버프 추가", ja: "バフ追加" },
  "editi.noBuffs": { en: "No buffs defined for this item.", ko: "이 아이템에 정의된 버프가 없습니다.", ja: "このアイテムにはバフが定義されていません。" }
};

export function useTranslation() {
  const { language } = useAppStore();
  
  const t = (key: string): string => {
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };

  return { t, language };
}
