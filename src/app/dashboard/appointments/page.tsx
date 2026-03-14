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

    <div className="p-6 text-gray-900 dark:text-gray-100">

      <h1 className="text-2xl font-bold mb-6">
        Agendamentos
      </h1>

      <div className="flex flex-wrap gap-3 mb-8">

        <select
        value={client}
        onChange={(e)=>setClient(e.target.value)}
        className="border rounded p-2 dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="">Cliente</option>
          {clients.map(c=>(
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
        value={vehicle}
        onChange={(e)=>setVehicle(e.target.value)}
        className="border rounded p-2 dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="">Veículo</option>
          {vehicles.map(v=>(
            <option key={v.id} value={v.id}>{v.plate}</option>
          ))}
        </select>

        <select
        value={service}
        onChange={(e)=>setService(e.target.value)}
        className="border rounded p-2 dark:bg-gray-800 dark:border-gray-700"
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
        className="border rounded p-2 dark:bg-gray-800 dark:border-gray-700"
        />

        <input
        type="time"
        value={time}
        onChange={(e)=>setTime(e.target.value)}
        className="border rounded p-2 dark:bg-gray-800 dark:border-gray-700"
        />

        <button
        onClick={createAppointment}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
        Agendar
        </button>

      </div>

      {loading ? (

        <p>Carregando...</p>

      ) : (

        <div className="grid gap-3">

          {appointments.map((a:any)=>(
            
            <div
            key={a.id}
            className="border rounded p-3 bg-white dark:bg-gray-800 dark:border-gray-700"
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