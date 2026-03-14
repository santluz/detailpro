'use client'

import Link from "next/link"

export default function Sidebar(){

  return(

    <div style={{
      width:220,
      background:"#111",
      color:"#fff",
      height:"100vh",
      padding:20
    }}>

      <h2 style={{marginBottom:30}}>DetailPro</h2>

      <nav style={{display:"flex",flexDirection:"column",gap:15}}>

        <Link href="/dashboard" style={{color:"#fff"}}>Dashboard</Link>

        <Link href="/clients" style={{color:"#fff"}}>Clientes</Link>

        <Link href="/vehicles" style={{color:"#fff"}}>Veículos</Link>

        <Link href="/appointments" style={{color:"#fff"}}>Agendamentos</Link>

        <Link href="/services" style={{color:"#fff"}}>Serviços</Link>

        <Link href="/financial" style={{color:"#fff"}}>Financeiro</Link>

        <Link href="/reports" style={{color:"#fff"}}>Relatórios</Link>

        <Link href="/settings" style={{color:"#fff"}}>Configurações</Link>

      </nav>

    </div>

  )

}
