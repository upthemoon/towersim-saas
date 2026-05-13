type Props = {
  className?: string;
  size?: number | string;
};

/**
 * 送電線鉄塔のシルエットアイコン。currentColor で色は親要素から継承。
 */
export function TowerIcon({ className, size = 24 }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* 上部三角（てっぺん） */}
      <path d="M32 4 L24 14 L40 14 Z" />
      {/* 上段腕 */}
      <rect x="14" y="14" width="36" height="2.5" />
      {/* 上段碍子（左右） */}
      <rect x="13" y="16.5" width="3" height="6" />
      <rect x="48" y="16.5" width="3" height="6" />
      {/* 中段腕 */}
      <rect x="10" y="24" width="44" height="2.5" />
      {/* 中段碍子 */}
      <rect x="9" y="26.5" width="3" height="6" />
      <rect x="52" y="26.5" width="3" height="6" />
      {/* 本体トラス（X 字を重ねた構造） */}
      <path d="M24 14 L20 56 L44 56 L40 14 L37 14 L41 56 L23 56 L27 14 Z" />
      {/* 内部 X 補強1 */}
      <path d="M25 20 L39 32 L25 44 L25 42 L37 32 L25 22 Z" />
      <path d="M39 20 L25 32 L39 44 L39 42 L27 32 L39 22 Z" />
      {/* 基礎部の二重ライン */}
      <rect x="14" y="56" width="36" height="2.5" />
      <rect x="14" y="60" width="36" height="2.5" />
    </svg>
  );
}
