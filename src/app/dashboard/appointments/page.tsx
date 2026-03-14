'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import {
  appointmentsService,
  clientsService,
  vehiclesService,
  servicesService
} from "@/lib/firebase/firestore"

import { useAuth } from "@/lib/hooks/useAuth"

export default function AppointmentsPage(){

  const { companyId } = useAuth()

  const [clients,setClients] = useState<any[]>([])
  const [vehicles,setVehicles] = useState<any[]>([])
  const [services,setServices] = useState<any[]>([])
  const [appointments,setAppointments] = useState<any[]>([])

  const [client,setClient] = useState("")
  const [vehicle,setVehicle] = useState("")
  const [service,setService] = useState("")
  const [date,setDate] = useState("")
  const [time,setTime] = useState("")

  const [loading,setLoading] = useState(true)

  async function loadData(){

    if(!companyId) return

    try{

      const [c,v,s,a] = await Promise.all([
        clientsService.getAll(companyId),
        vehiclesService.getAll(companyId),
        servicesService.getAll(companyId),
        appointmentsService.getAll(companyId)
      ])

      setClients(c)
      setVehicles(v)
      setServices(s)
      setAppointments(a)

    }catch(e){

      console.error(e)

    }finally{

      setLoading(false)

    }

  }

  async function createAppointment(){

    if(!client || !vehicle || !service || !date || !time) return

    try{

      await appointmentsService.create({
        companyId,
        clientId:client,
        vehicleId:vehicle,
        serviceId:service,
        date,
        time
      })

      setClient("")
      setVehicle("")
      setService("")
      setDate("")
      setTime("")

      loadData()

    }catch(e){

      console.error(e)

    }

  }

  useEffect(()=>{

    if(companyId){
      loadData()
    }

  },[companyId])

  return(

    <div style={{padding:20,color:"var(--text-color)"}}>

      <h1 style={{
        fontSize:26,
        fontWeight:"bold",
        marginBottom:20
      }}>
        Agendamentos
      </h1>

      <div style={{
        display:"flex",
        flexWrap:"wrap",
        gap:10,
        marginBottom:30
      }}>

        <select
        value={client}
        onChange={(e)=>setClient(e.target.value)}
        style={{padding:8}}
        >
          <option value="">Cliente</option>
          {clients.map(c=>(
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
        value={vehicle}
        onChange={(e)=>setVehicle(e.target.value)}
        style={{padding:8}}
        >
          <option value="">Veículo</option>
          {vehicles.map(v=>(
            <option key={v.id} value={v.id}>{v.plate}</option>
          ))}
        </select>

        <select
        value={service}
        onChange={(e)=>setService(e.target.value)}
        style={{padding:8}}
        >
          <option value="">Serviço</option>
          {services.map(s=>(
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <input
        type="date"
        value={date}
        onChange={(e)=>setDate(e.target.value)}
        style={{padding:8}}
        />

        <input
        type="time"
        value={time}
        onChange={(e)=>setTime(e.target.value)}
        style={{padding:8}}
        />

        <button
        onClick={createAppointment}
        style={{
          padding:"8px 14px",
          background:"#2563eb",
          color:"#fff",
          borderRadius:6,
          border:"none",
          cursor:"pointer"
        }}
        >
        Agendar
        </button>

      </div>

      {loading ? (

        <p>Carregando...</p>

      ) : (

        <div style={{display:"grid",gap:10}}>

          {appointments.map((a:any)=>(
            
            <div
            key={a.id}
            style={{
              padding:12,
              borderRadius:8,
              border:"1px solid #e5e7eb",
              background:"var(--card-bg)"
            }}
            >

            <strong>{a.date} - {a.time}</strong>

            <div>Cliente: {a.clientId}</div>

            </div>

          ))}

        </div>

      )}

    </div>

  )

}