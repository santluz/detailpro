'use client';
import { useState } from 'react';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore/lite';
import { db, auth } from '@/lib/firebase/config';

export default function DebugPage() {
  const [log, setLog] = useState<string[]>([]);
  const add = (msg: string) => setLog(p => [...p, `${new Date().toLocaleTimeString()}: ${msg}`]);

  async function testWrite() {
    add('Iniciando teste de escrita...');
    try {
      add(`Auth user: ${auth.currentUser?.uid || 'NÃO LOGADO'}`);
      const ref = await addDoc(collection(db, '_test'), {
        msg: 'teste', uid: auth.currentUser?.uid, ts: serverTimestamp(),
      });
      add(`✅ ESCRITA OK! ID: ${ref.id}`);
    } catch (err: unknown) {
      add(`❌ ERRO ESCRITA: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function testRead() {
    add('Testando leitura...');
    try {
      const snap = await getDocs(collection(db, '_test'));
      add(`✅ LEITURA OK! ${snap.docs.length} docs`);
    } catch (err: unknown) {
      add(`❌ ERRO LEITURA: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function testUsers() {
    add('Buscando usuários...');
    try {
      const snap = await getDocs(collection(db, 'users'));
      snap.docs.forEach(d => {
        const data = d.data() as Record<string,string>;
        add(`User: ${d.id} | company: ${data.companyId} | email: ${data.email}`);
      });
    } catch (err: unknown) {
      add(`❌ ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function testCompanies() {
    add('Buscando empresas...');
    try {
      const snap = await getDocs(collection(db, 'companies'));
      snap.docs.forEach(d => {
        const data = d.data() as Record<string,string>;
        add(`Company: ${d.id} | nome: ${data.name}`);
      });
    } catch (err: unknown) {
      add(`❌ ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: 'monospace', background: '#0a0a0a', color: '#00ff00', minHeight: '100vh' }}>
      <h1 style={{ color: '#fff', marginBottom: 16 }}>🔧 Debug Firestore</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Testar Escrita', fn: testWrite, color: '#0070f3' },
          { label: 'Testar Leitura', fn: testRead, color: '#0070f3' },
          { label: 'Ver Usuários', fn: testUsers, color: '#7c3aed' },
          { label: 'Ver Empresas', fn: testCompanies, color: '#7c3aed' },
          { label: 'Limpar', fn: () => setLog([]), color: '#444' },
        ].map(b => (
          <button key={b.label} onClick={b.fn} style={{ padding: '8px 16px', background: b.color, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{b.label}</button>
        ))}
      </div>
      <div style={{ background: '#000', padding: 16, borderRadius: 8, minHeight: 300, fontSize: 13 }}>
        {log.length === 0 && <p style={{ color: '#555' }}>Clique nos botões para testar...</p>}
        {log.map((l, i) => <div key={i} style={{ color: l.includes('✅') ? '#0f0' : l.includes('❌') ? '#f00' : '#0f0' }}>{l}</div>)}
      </div>
    </div>
  );
}
