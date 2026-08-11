"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Menu = {
  name: string;
  category: string;
  description: string;
  price: string;
  emoji: string;
  tone: string;
  tags: string[];
  time: string;
};

const menus: Menu[] = [
  { name: "제육볶음", category: "든든하게", description: "매콤달콤한 소스에 볶아낸 밥도둑", price: "9,000원", emoji: "🥘", tone: "coral", tags: ["매콤", "밥도둑"], time: "12분" },
  { name: "냉모밀 & 돈카츠", category: "가볍게", description: "시원한 메밀과 바삭한 한 끼", price: "11,000원", emoji: "🍱", tone: "blue", tags: ["시원함", "바삭함"], time: "18분" },
  { name: "치킨 샐러드", category: "가볍게", description: "신선한 채소와 담백한 닭가슴살", price: "10,500원", emoji: "🥗", tone: "green", tags: ["건강식", "저탄고지"], time: "10분" },
  { name: "마라탕", category: "새로운 맛", description: "오늘은 조금 특별하게, 얼얼하게", price: "12,000원", emoji: "🍜", tone: "pink", tags: ["얼얼함", "커스텀"], time: "15분" },
  { name: "김치찌개", category: "든든하게", description: "익숙해서 더 좋은 따뜻한 국물", price: "8,500원", emoji: "🍲", tone: "yellow", tags: ["뜨끈함", "국물"], time: "13분" },
  { name: "연어 포케", category: "가볍게", description: "상큼한 소스와 부드러운 연어", price: "13,000원", emoji: "🍣", tone: "lavender", tags: ["신선함", "밸런스"], time: "9분" },
];

const categories = ["전체", "든든하게", "가볍게", "새로운 맛"];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [saved, setSaved] = useState<string[]>([]);
  const [picked, setPicked] = useState<Menu | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(false);
  const [toast, setToast] = useState("");

  const filteredMenus = useMemo(
    () => activeCategory === "전체" ? menus : menus.filter((menu) => menu.category === activeCategory),
    [activeCategory],
  );

  useEffect(() => {
    let mounted = true;
    async function loadSavedMenus() {
      let { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const result = await supabase.auth.signInAnonymously();
        session = result.data.session;
        if (result.error) setToast("찜 기능을 연결하지 못했어요. 잠시 후 다시 시도해주세요.");
      }
      if (!session || !mounted) return;
      const { data, error } = await supabase.from("saved_menus").select("menu_name").eq("user_id", session.user.id);
      if (!error && data) setSaved(data.map((item) => item.menu_name));
      if (mounted) setSupabaseReady(true);
    }
    void loadSavedMenus();
    return () => { mounted = false; };
  }, []);

  function pickForMe() {
    const pool = filteredMenus.length ? filteredMenus : menus;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    setPicked(choice);
    setToast(`${choice.name} 어때요? 오늘은 이걸로 가보세요!`);
    window.setTimeout(() => setToast(""), 3200);
  }

  async function toggleSaved(name: string) {
    if (!supabaseReady) {
      setToast("찜 기능을 준비하고 있어요. 잠시만 기다려주세요.");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const menu = menus.find((item) => item.name === name);
    if (!user || !menu) return;
    const alreadySaved = saved.includes(name);
    const result = alreadySaved
      ? await supabase.from("saved_menus").delete().eq("user_id", user.id).eq("menu_name", name)
      : await supabase.from("saved_menus").insert({ user_id: user.id, menu_name: menu.name, category: menu.category, description: menu.description, price: menu.price, emoji: menu.emoji, tone: menu.tone, tags: menu.tags, time: menu.time });
    if (result.error) {
      setToast("저장에 실패했어요. 잠시 후 다시 시도해주세요.");
      return;
    }
    setSaved((current) => alreadySaved ? current.filter((item) => item !== name) : [...current, name]);
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="오늘이 메뉴 홈"><span className="brand-mark">오늘</span><span>이 메뉴</span></a>
        <nav><a href="#menus">메뉴 둘러보기</a><a href="#saved">찜한 메뉴 <span className="saved-count">{saved.length}</span></a></nav>
        <button className="profile-button" aria-label="프로필">김</button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">WEDNESDAY, AUGUST 11 <span>·</span> 서울</p>
          <h1>오늘 점심,<br /><em>뭐 먹지?</em></h1>
          <p className="hero-sub">고민은 짧게, 맛있는 점심은 확실하게.<br />지금 딱 끌리는 메뉴를 찾아보세요.</p>
          <button className="primary-button" onClick={pickForMe}>오늘은 내가 정해줄게 <span>✦</span></button>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="art-sun">☀</div><div className="art-bowl">🍚</div><div className="art-leaf leaf-one">✦</div><div className="art-leaf leaf-two">✳</div><div className="art-note">오늘도<br />잘 먹자!</div></div>
      </section>

      <section className="menu-section" id="menus">
        <div className="section-heading"><div><p className="eyebrow">YOUR LUNCH, YOUR WAY</p><h2>지금 기분에 맞는<br /><span>점심 메뉴</span></h2></div><p className="section-note">오늘의 컨디션과 입맛에 맞춰<br />골라봤어요.</p></div>
        <div className="filters" role="tablist" aria-label="메뉴 카테고리">{categories.map((category) => <button key={category} className={activeCategory === category ? "filter active" : "filter"} onClick={() => setActiveCategory(category)} role="tab" aria-selected={activeCategory === category}>{category}</button>)}</div>
        <div className="menu-grid">{filteredMenus.map((menu) => <article className="menu-card" key={menu.name}>
          <div className={`menu-visual ${menu.tone}`}><span className="menu-emoji">{menu.emoji}</span><button className={saved.includes(menu.name) ? "heart saved" : "heart"} onClick={() => toggleSaved(menu.name)} aria-label={`${menu.name} ${saved.includes(menu.name) ? "찜 취소" : "찜하기"}`}>{saved.includes(menu.name) ? "♥" : "♡"}</button><span className="time-badge">⏱ {menu.time}</span></div>
          <div className="menu-info"><div className="menu-title"><h3>{menu.name}</h3><span>{menu.price}</span></div><p>{menu.description}</p><div className="tags">{menu.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div></div>
        </article>)}</div>
      </section>

      <section className="decision-box" id="saved"><div><p className="eyebrow">STILL CAN&apos;T DECIDE?</p><h2>그래도 못 고르겠다면,<br /><span>저장한 메뉴</span>에서 골라보세요.</h2></div><button className="secondary-button" onClick={() => setShowSaved(true)}>찜한 메뉴 보기 <span>→</span></button></section>
      <footer><span>오늘이 메뉴</span><span>점심 고민을 덜어드려요 · Made for busy weekdays</span></footer>
      {picked && <div className="result-modal" role="dialog" aria-modal="true"><div className="result-card"><button className="close" onClick={() => setPicked(null)} aria-label="닫기">×</button><span className="result-emoji">{picked.emoji}</span><p className="eyebrow">TODAY&apos;S PICK</p><h2>{picked.name}</h2><p>{picked.description}</p><button className="primary-button" onClick={() => setPicked(null)}>좋아, 이걸로 먹을게!</button></div></div>}
      {showSaved && <div className="result-modal" role="dialog" aria-modal="true" aria-labelledby="saved-title"><div className="saved-modal"><button className="close" onClick={() => setShowSaved(false)} aria-label="닫기">×</button><p className="eyebrow">YOUR SAVED MENUS</p><h2 id="saved-title">찜한 메뉴</h2>{saved.length === 0 ? <div className="empty-saved"><span>♡</span><p>아직 찜한 메뉴가 없어요.<br />마음에 드는 메뉴에 하트를 눌러보세요.</p></div> : <div className="saved-list">{menus.filter((menu) => saved.includes(menu.name)).map((menu) => <button className="saved-row" key={menu.name} onClick={() => { setPicked(menu); setShowSaved(false); }}><span className={`saved-row-icon ${menu.tone}`}>{menu.emoji}</span><span><strong>{menu.name}</strong><small>{menu.description}</small></span><span className="saved-arrow">→</span></button>)}</div>}</div></div>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
