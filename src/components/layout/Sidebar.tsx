'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Sidebar() {

  const pathname = usePathname()

  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Clientes", path: "/dashboard/clients" },
    { name: "Veículos", path: "/dashboard/vehicles" },
    { name: "Agendamentos", path: "/dashboard/appointments" },
    { name: "Serviços", path: "/dashboard/services" },
    { name: "Financeiro", path: "/dashboard/financial" },
    { name: "Relatórios", path: "/dashboard/reports" },
    { name: "Configurações", path: "/dashboard/settings" },
  ]

  return (

    <div
      style={{
        width: 240,
        background: "#0f172a",
        color: "white",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        padding: 20
      }}
    >

      <h2 style={{ marginBottom: 30 }}>
        DetailPro
      </h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        {menu.map(item => (

          <Link
            key={item.path}
            href={item.path}
            style={{
              padding: "10px 12px",
              borderRadius: 6,
              textDecoration: "none",
              color: "white",
              background:
                pathname === item.path
                  ? "#1e293b"
                  : "transparent"
            }}
          >
            {item.name}
          </Link>

        ))}

      </nav>

    </div>

  )

}
