interface CoinInfo {
  symbol?: string;
  name?: string;
  image?: string;
  category_name?: string;
  homepage?: string;
}

interface SignalCardProps {
  signalId?: string;
  coinId: string;
  signalType: string;
  entryPrice: number;
  priceChangePercent: number;
  isHighlighted?: boolean;
  coin?: CoinInfo | null;
  onClick?: (signalId: string) => void;
}

const SYMBOL_MAP: Record<string, string> = {
  bitcoin: "₿",
  ethereum: "Ξ",
  solana: "◎",
  pepe: "P",
};

function getSymbol(coinId: string): string {
  const lower = coinId.toLowerCase();
  return SYMBOL_MAP[lower] ?? coinId.slice(0, 1).toUpperCase();
}

function getSignalStyles(type: string) {
  switch (type) {
    case "strong_buy":
      return "bg-brand-orange/10 border-brand-orange/30 text-brand-orange";
    case "buy":
      return "bg-yellow-500/10 border-yellow-500/30 text-yellow-500";
    default:
      return "bg-gray-500/10 border-gray-500/30 text-gray-400";
  }
}

export default function SignalCard({
  signalId,
  coinId,
  signalType,
  entryPrice,
  priceChangePercent,
  isHighlighted = false,
  coin,
  onClick,
}: SignalCardProps) {
  const handleClick = () => {
    if (signalId && onClick) onClick(signalId);
  };

  const cardClass = isHighlighted
    ? "glass-panel p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 glow-border-orange hover:bg-brand-orange/[0.03] transition-colors cursor-pointer"
    : "glass-panel p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer";

  const momentumColor =
    signalType === "strong_buy"
      ? "text-brand-orange"
      : signalType === "buy"
        ? "text-yellow-500"
        : "text-gray-400";

  const symbol = coin?.symbol?.toUpperCase() ?? coinId.toUpperCase();
  const category = coin?.category_name;

  return (
    <div
      className={cardClass}
      onClick={signalId && onClick ? handleClick : undefined}
      role={signalId && onClick ? "button" : undefined}
    >
      <div className="flex items-center space-x-4 min-w-0">
        {coin?.image ? (
          <img src={coin.image} alt="" className="w-10 h-10 rounded-lg flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-lg flex-shrink-0">
            {getSymbol(coinId)}
          </div>
        )}
        <div className="min-w-0">
          <h4 className="font-bold truncate">{symbol}/USDT</h4>
          <p className="text-xs text-gray-500 truncate">
            {category ? `${category} • ` : ""}Momentum Engine
          </p>
        </div>
      </div>
      <div className="text-right flex flex-wrap gap-4 sm:gap-6 sm:space-x-12 items-center">
        <div>
          <p className="text-xs text-gray-500 font-bold uppercase">Price</p>
          <p className="font-mono text-sm truncate">
            ${Number(entryPrice).toLocaleString(undefined, { maximumFractionDigits: 6 })}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-bold uppercase">Momentum</p>
          <p className={`font-mono text-sm font-bold ${momentumColor}`}>
            +{priceChangePercent}%
          </p>
        </div>
        <div
          className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getSignalStyles(
            signalType
          )} border`}
        >
          {signalType.replace("_", " ")}
        </div>
      </div>
    </div>
  );
}
