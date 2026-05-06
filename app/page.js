"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ShoppingBag,
  Plus,
  Minus,
  X,
  Send,
  MapPin,
  Phone,
  User,
  ChevronUp,
  Clock,
  Store,
  Wheat,
  CakeSlice,
  Beef,
  CheckCircle2,
  AlertTriangle,
  Trash2,
} from "lucide-react";

/* ─── Product Catalog ──────────────────────────────────────── */
const PRODUCTS = [
  {
    id: 1,
    name: "Pão Francês",
    description: "Crocante por fora, macio por dentro. Assado na hora!",
    price: 0.75,
    unit: "Unidade",
    category: "Pães",
    emoji: "🥖",
  },
  {
    id: 2,
    name: "Pão de Queijo",
    description: "Porção com 6 unidades quentinhas e derretendo.",
    price: 12.0,
    unit: "Porção (6 un.)",
    category: "Pães",
    emoji: "🧀",
  },
  {
    id: 3,
    name: "Pão Integral",
    description: "Rico em fibras e grãos selecionados.",
    price: 2.5,
    unit: "Unidade",
    category: "Pães",
    emoji: "🍞",
  },
  {
    id: 4,
    name: "Bolo de Rolo",
    description: "Tradição pernambucana — goiabada artesanal de verdade.",
    price: 8.0,
    unit: "Fatia",
    category: "Doces",
    emoji: "🍥",
    badge: "PE 🇧🇷",
  },
  {
    id: 5,
    name: "Bolo de Rolo Inteiro",
    description: "O clássico de Pernambuco para a família toda.",
    price: 45.0,
    unit: "Inteiro",
    category: "Doces",
    emoji: "🎂",
    badge: "PE 🇧🇷",
  },
  {
    id: 6,
    name: "Brigadeiro Gourmet",
    description: "Chocolate belga 70% cacau. Irresistível.",
    price: 3.5,
    unit: "Unidade",
    category: "Doces",
    emoji: "🍫",
  },
  {
    id: 7,
    name: "Presunto Fatiado",
    description: "Fatiado na hora, marca premium.",
    price: 5.5,
    unit: "100g",
    category: "Frios",
    emoji: "🥩",
  },
  {
    id: 8,
    name: "Queijo Mussarela",
    description: "Mussarela fresca fatiada de qualidade.",
    price: 6.0,
    unit: "100g",
    category: "Frios",
    emoji: "🧀",
  },
  {
    id: 9,
    name: "Mortadela Defumada",
    description: "Sabor defumado artesanal. Pedaço generoso.",
    price: 4.0,
    unit: "100g",
    category: "Frios",
    emoji: "🥓",
  },
];

const CATEGORIES = [
  { name: "Todos", icon: Store },
  { name: "Pães", icon: Wheat },
  { name: "Doces", icon: CakeSlice },
  { name: "Frios", icon: Beef },
];

/* ─── Currency formatter ───────────────────────────────────── */
const fmt = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ═══════════════════════════════════════════════════════════ */
/*                      MAIN PAGE                              */
/* ═══════════════════════════════════════════════════════════ */
export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    whatsapp: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  /* ── Derived state ─────────────────────────────────────── */
  const filteredProducts = useMemo(() => {
    if (activeCategory === "Todos") return PRODUCTS;
    return PRODUCTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const product = PRODUCTS.find((p) => p.id === parseInt(id));
        return { ...product, quantity: qty, subtotal: product.price * qty };
      });
  }, [cart]);

  const cartTotal = useMemo(
    () => cartItems.reduce((s, i) => s + i.subtotal, 0),
    [cartItems]
  );
  const cartCount = useMemo(
    () => cartItems.reduce((s, i) => s + i.quantity, 0),
    [cartItems]
  );

  /* ── Cart actions ──────────────────────────────────────── */
  const addToCart = useCallback((id) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[id] > 1) next[id]--;
      else delete next[id];
      return next;
    });
  }, []);

  const clearItem = useCallback((id) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  /* ── Checkout handler ──────────────────────────────────── */
  const handleCheckout = async () => {
    if (!formData.nome || !formData.endereco || !formData.whatsapp) return;

    setIsSubmitting(true);
    setOrderResult(null);

    const payload = {
      cliente: {
        nome: formData.nome,
        endereco: formData.endereco,
        whatsapp: formData.whatsapp,
      },
      produtos: cartItems.map((item) => ({
        id: item.id,
        nome: item.name,
        quantidade: item.quantity,
        precoUnitario: item.price,
        subtotal: item.subtotal,
        unidade: item.unit,
      })),
      total: cartTotal,
      dataHora: new Date().toISOString(),
    };

    try {
      const res = await fetch("http://localhost:3001/enviar-pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao enviar pedido");

      setOrderResult("success");
      setCart({});
      setFormData({ nome: "", endereco: "", whatsapp: "" });
    } catch {
      setOrderResult("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Reset after result ────────────────────────────────── */
  const handleResetResult = () => {
    setOrderResult(null);
    if (orderResult === "success") {
      setIsCheckout(false);
      setIsCartOpen(false);
    }
  };

  /* ═══════════════════════════════════════════════════════ */
  /*                       RENDER                            */
  /* ═══════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen max-w-md mx-auto relative pb-24">
      {/* ── HEADER ───────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-coffee-800 via-coffee-700 to-coffee-800 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🥐</span>
            <div>
              <h1 className="text-wheat-200 font-bold text-lg leading-tight tracking-tight">
                DeliveryPada
              </h1>
              <p className="text-wheat-400/70 text-[11px] font-medium">
                Padaria & Confeitaria
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-coffee-900/40 px-3 py-1.5 rounded-full border border-green-500/30">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-glow" />
            <span className="text-green-400 text-xs font-semibold">Aberto</span>
            <Clock size={12} className="text-green-400/60" />
          </div>
        </div>

        {/* ── CATEGORY MENU ─────────────────────────────── */}
        <nav className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200
                  ${
                    active
                      ? "bg-wheat-400 text-coffee-900 shadow-md shadow-wheat-400/30 scale-105"
                      : "bg-coffee-600/50 text-wheat-200 hover:bg-coffee-600"
                  }`}
              >
                <Icon size={14} />
                {cat.name}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ── PRODUCT LIST ─────────────────────────────────── */}
      <main className="px-4 py-4 space-y-3">
        {filteredProducts.map((product) => {
          const qty = cart[product.id] || 0;
          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md shadow-coffee-200/40 border border-coffee-100/60 overflow-hidden
                         flex items-stretch transition-all duration-200 hover:shadow-lg"
            >
              {/* Emoji area */}
              <div className="w-24 min-h-[100px] bg-gradient-to-br from-wheat-100 to-wheat-200 flex items-center justify-center relative shrink-0">
                <span className="text-5xl">{product.emoji}</span>
                {product.badge && (
                  <span className="absolute top-1.5 left-1.5 text-[9px] bg-coffee-700 text-wheat-200 px-1.5 py-0.5 rounded-full font-bold">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="font-bold text-coffee-800 text-[15px] leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-coffee-400 text-xs mt-0.5 line-clamp-2">
                    {product.description}
                  </p>
                </div>
                <div className="flex items-end justify-between mt-2">
                  <div>
                    <p className="text-wheat-700 font-extrabold text-lg leading-none">
                      {fmt(product.price)}
                    </p>
                    <p className="text-coffee-300 text-[10px] font-medium">
                      / {product.unit}
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-1">
                    {qty > 0 && (
                      <>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="w-9 h-9 rounded-xl bg-coffee-100 text-coffee-600 flex items-center justify-center
                                     active:scale-90 transition-transform"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus size={18} strokeWidth={3} />
                        </button>
                        <span className="w-7 text-center font-bold text-coffee-800 text-sm animate-bounce-in">
                          {qty}
                        </span>
                      </>
                    )}
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-9 h-9 rounded-xl bg-wheat-500 text-coffee-900 flex items-center justify-center
                                 shadow-md shadow-wheat-500/40 active:scale-90 transition-transform"
                      aria-label="Adicionar ao carrinho"
                    >
                      <Plus size={18} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* ── FLOATING CART BAR ────────────────────────────── */}
      {cartCount > 0 && (
        <button
          onClick={() => {
            setIsCartOpen(true);
            setIsCheckout(false);
            setOrderResult(null);
          }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50
                     bg-gradient-to-r from-coffee-800 to-coffee-700 text-white rounded-2xl px-5 py-4
                     flex items-center justify-between shadow-2xl shadow-coffee-800/50
                     active:scale-[0.98] transition-transform animate-slide-up"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag size={22} className="text-wheat-300" />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-wheat-400 text-coffee-900 text-[11px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </div>
            <span className="text-sm font-semibold text-wheat-100">
              Ver carrinho
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-wheat-300 text-lg">
              {fmt(cartTotal)}
            </span>
            <ChevronUp size={18} className="text-wheat-400" />
          </div>
        </button>
      )}

      {/* ── BOTTOM SHEET (Cart + Checkout) ───────────────── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => {
              setIsCartOpen(false);
              setIsCheckout(false);
              setOrderResult(null);
            }}
          />

          {/* Sheet */}
          <div className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-coffee-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-coffee-100">
              <h2 className="font-bold text-coffee-800 text-lg">
                {isCheckout
                  ? "📋 Dados da Entrega"
                  : `🛒 Seu Pedido (${cartCount})`}
              </h2>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckout(false);
                  setOrderResult(null);
                }}
                className="p-1.5 rounded-full hover:bg-coffee-100 transition-colors"
              >
                <X size={20} className="text-coffee-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* ── Order result overlay ──── */}
              {orderResult && (
                <div className="flex flex-col items-center justify-center py-8 text-center animate-bounce-in">
                  {orderResult === "success" ? (
                    <>
                      <CheckCircle2 size={56} className="text-green-500 mb-3" />
                      <h3 className="font-bold text-xl text-coffee-800 mb-1">
                        Pedido Enviado! 🎉
                      </h3>
                      <p className="text-coffee-400 text-sm mb-6">
                        Você receberá a confirmação pelo WhatsApp em instantes.
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={56} className="text-amber-500 mb-3" />
                      <h3 className="font-bold text-xl text-coffee-800 mb-1">
                        Ops! Algo deu errado 😕
                      </h3>
                      <p className="text-coffee-400 text-sm mb-6">
                        Parece que nosso sistema está temporariamente offline.
                        <br />
                        Tente novamente em alguns segundos.
                      </p>
                    </>
                  )}
                  <button
                    onClick={handleResetResult}
                    className="bg-wheat-500 text-coffee-900 px-6 py-3 rounded-xl font-bold
                               shadow-md shadow-wheat-500/30 active:scale-95 transition-transform"
                  >
                    {orderResult === "success" ? "Fechar" : "Tentar Novamente"}
                  </button>
                </div>
              )}

              {/* ── Checkout form ──── */}
              {isCheckout && !orderResult && (
                <div className="space-y-4">
                  {/* Nome */}
                  <div>
                    <label className="text-xs font-semibold text-coffee-500 mb-1 flex items-center gap-1">
                      <User size={13} /> Nome completo
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, nome: e.target.value }))
                      }
                      placeholder="Seu nome"
                      className="w-full border border-coffee-200 rounded-xl px-4 py-3 text-sm text-coffee-800
                                 placeholder:text-coffee-300 focus:outline-none focus:ring-2 focus:ring-wheat-400
                                 focus:border-transparent transition-all bg-wheat-50/50"
                    />
                  </div>

                  {/* Endereço */}
                  <div>
                    <label className="text-xs font-semibold text-coffee-500 mb-1 flex items-center gap-1">
                      <MapPin size={13} /> Endereço de entrega
                    </label>
                    <input
                      type="text"
                      value={formData.endereco}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, endereco: e.target.value }))
                      }
                      placeholder="Rua, número, bairro"
                      className="w-full border border-coffee-200 rounded-xl px-4 py-3 text-sm text-coffee-800
                                 placeholder:text-coffee-300 focus:outline-none focus:ring-2 focus:ring-wheat-400
                                 focus:border-transparent transition-all bg-wheat-50/50"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="text-xs font-semibold text-coffee-500 mb-1 flex items-center gap-1">
                      <Phone size={13} /> WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, whatsapp: e.target.value }))
                      }
                      placeholder="(81) 99999-9999"
                      className="w-full border border-coffee-200 rounded-xl px-4 py-3 text-sm text-coffee-800
                                 placeholder:text-coffee-300 focus:outline-none focus:ring-2 focus:ring-wheat-400
                                 focus:border-transparent transition-all bg-wheat-50/50"
                    />
                  </div>

                  {/* Summary */}
                  <div className="bg-wheat-100/60 rounded-xl p-4 border border-wheat-200/60">
                    <h4 className="text-xs font-bold text-coffee-600 mb-2">
                      Resumo do Pedido
                    </h4>
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-xs text-coffee-500 py-0.5"
                      >
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-semibold">
                          {fmt(item.subtotal)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-wheat-300/50 mt-2 pt-2 flex justify-between font-bold text-coffee-800">
                      <span>Total</span>
                      <span className="text-wheat-700">{fmt(cartTotal)}</span>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    onClick={handleCheckout}
                    disabled={
                      isSubmitting ||
                      !formData.nome ||
                      !formData.endereco ||
                      !formData.whatsapp
                    }
                    className="w-full bg-gradient-to-r from-wheat-500 to-wheat-600 text-coffee-900 py-4 rounded-xl
                               font-bold text-base flex items-center justify-center gap-2
                               shadow-lg shadow-wheat-500/30 disabled:opacity-50 disabled:cursor-not-allowed
                               active:scale-[0.98] transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-5 h-5 border-2 border-coffee-600 border-t-transparent rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Enviar Pedido
                      </>
                    )}
                  </button>

                  {/* Back button */}
                  <button
                    onClick={() => setIsCheckout(false)}
                    className="w-full text-coffee-400 text-sm font-semibold py-2"
                  >
                    ← Voltar ao carrinho
                  </button>
                </div>
              )}

              {/* ── Cart items list ──── */}
              {!isCheckout && !orderResult && (
                <div className="space-y-3">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag
                        size={48}
                        className="text-coffee-200 mx-auto mb-3"
                      />
                      <p className="text-coffee-400 text-sm">
                        Seu carrinho está vazio
                      </p>
                    </div>
                  ) : (
                    <>
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 bg-wheat-50 rounded-xl p-3 border border-wheat-200/50"
                        >
                          <span className="text-3xl">{item.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-coffee-800 truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-coffee-400">
                              {fmt(item.price)} / {item.unit}
                            </p>
                          </div>

                          {/* Qty controls */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-8 h-8 rounded-lg bg-coffee-100 text-coffee-600 flex items-center justify-center
                                         active:scale-90 transition-transform"
                            >
                              <Minus size={15} strokeWidth={3} />
                            </button>
                            <span className="w-6 text-center font-bold text-sm text-coffee-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => addToCart(item.id)}
                              className="w-8 h-8 rounded-lg bg-wheat-400 text-coffee-900 flex items-center justify-center
                                         active:scale-90 transition-transform"
                            >
                              <Plus size={15} strokeWidth={3} />
                            </button>
                          </div>

                          {/* Subtotal + remove */}
                          <div className="flex flex-col items-end gap-1 ml-1">
                            <span className="font-bold text-sm text-wheat-700">
                              {fmt(item.subtotal)}
                            </span>
                            <button
                              onClick={() => clearItem(item.id)}
                              className="text-red-400 hover:text-red-500 transition-colors"
                              aria-label="Remover item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Total + CTA */}
                      <div className="border-t border-coffee-100 pt-4 mt-2">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-bold text-coffee-800">
                            Total
                          </span>
                          <span className="font-extrabold text-xl text-wheat-700">
                            {fmt(cartTotal)}
                          </span>
                        </div>
                        <button
                          onClick={() => setIsCheckout(true)}
                          className="w-full bg-gradient-to-r from-coffee-700 to-coffee-800 text-wheat-200 py-4 rounded-xl
                                     font-bold text-base flex items-center justify-center gap-2
                                     shadow-lg shadow-coffee-800/40 active:scale-[0.98] transition-all"
                        >
                          <Send size={18} />
                          Finalizar Pedido
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
