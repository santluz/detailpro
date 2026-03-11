'use client';
import { useState } from 'react';
import { MessageCircle, Mail, Phone, FileText, ChevronDown, ChevronUp, ExternalLink, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const faqs = [
  { q: 'Como cadastrar um novo cliente?', a: 'Vá em "Clientes" no menu lateral, clique em "Novo Cliente", preencha os dados e salve.' },
  { q: 'Como agendar um serviço?', a: 'Acesse "Agenda", clique em um horário no calendário ou no botão "Novo Agendamento".' },
  { q: 'Como lançar uma receita ou despesa?', a: 'Vá em "Financeiro", clique em "Nova Transação" e selecione o tipo.' },
  { q: 'Como cadastrar funcionários?', a: 'Acesse "Funcionários", clique em "Novo Funcionário" e preencha os dados.' },
  { q: 'Como controlar o estoque?', a: 'No módulo "Estoque" cadastre produtos, ajuste quantidades e receba alertas de estoque baixo.' },
  { q: 'Meus dados são seguros?', a: 'Sim! Todos os dados são salvos automaticamente no Firebase Cloud com criptografia.' },
];

export default function SuportePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ nome: '', email: '', mensagem: '' });

  function handleSend() {
    if (!form.nome || !form.email || !form.mensagem) { toast.error('Preencha todos os campos'); return; }
    toast.success('Mensagem enviada! Retornaremos em até 24h.');
    setForm({ nome: '', email: '', mensagem: '' });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suporte</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Estamos aqui para ajudar você</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: MessageCircle, color: 'sky', label: 'WhatsApp', sub: 'Atendimento rápido', href: 'https://wa.me/5511999999999', link: 'Iniciar conversa' },
          { icon: Mail, color: 'purple', label: 'E-mail', sub: 'Resposta em até 24h', href: 'mailto:suporte@detailpro.com.br', link: 'suporte@detailpro.com.br' },
          { icon: Phone, color: 'green', label: 'Telefone', sub: 'Seg–Sex, 9h às 18h', href: 'tel:+5511999999999', link: '(11) 99999-9999' },
        ].map(({ icon: Icon, color, label, sub, href, link }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center gap-3">
            <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900/30 rounded-xl flex items-center justify-center`}>
              <Icon className={`w-6 h-6 text-${color}-500`} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{sub}</p>
            </div>
            <a href={href} target="_blank" rel="noopener noreferrer" className="mt-auto text-sm text-sky-500 hover:underline flex items-center gap-1">
              {link} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <FileText className="w-5 h-5 text-sky-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Perguntas Frequentes</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {faqs.map((faq, i) => (
            <div key={i} className="p-4">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between text-left gap-4">
                <span className="font-medium text-gray-900 dark:text-white">{faq.q}</span>
                {openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
              </button>
              {openFaq === i && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Enviar mensagem</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Não encontrou o que procurava? Fale conosco.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
              <input className="input w-full" placeholder="Seu nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
              <input className="input w-full" placeholder="seu@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensagem</label>
            <textarea className="input w-full h-28 resize-none" placeholder="Descreva sua dúvida..." value={form.mensagem} onChange={e => setForm({ ...form, mensagem: e.target.value })} />
          </div>
          <button onClick={handleSend} className="btn-primary flex items-center gap-2">
            <Send className="w-4 h-4" /> Enviar mensagem
          </button>
        </div>
      </div>
    </div>
  );
}
