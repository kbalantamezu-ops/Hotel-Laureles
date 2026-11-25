"use client";

import { useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { api } from "@/lib/api";

const NUEVA = { id_habitacion: "", fecha_entrada: "", fecha_salida: "", cantidad_huespedes: "1", observaciones: "" };
const HUESPED_VACIO = { nombres: "", apellidos: "", documento: "", telefono: "", correo: "", nacionalidad: "" };

function datosEdicion(reserva) {
  return {
    id_habitacion: String(reserva.id_habitacion),
    fecha_entrada: String(reserva.fecha_entrada).slice(0, 10),
    fecha_salida: String(reserva.fecha_salida).slice(0, 10),
    cantidad_huespedes: String(reserva.cantidad_huespedes),
    observaciones: reserva.observaciones || "",
  };
}

export default function MisReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [form, setForm] = useState(NUEVA);
  const [edicion, setEdicion] = useState(null);
  const [huespedes, setHuespedes] = useState({});
  const [abierta, setAbierta] = useState(null);
  const [nuevoHuesped, setNuevoHuesped] = useState(HUESPED_VACIO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const obtenerDatos = () => Promise.all([api.misReservas.lista(), api.habitaciones.lista()]);

  const cargar = async () => {
    try {
      const [lista, cuartos] = await obtenerDatos();
      setReservas(Array.isArray(lista) ? lista : []);
      setHabitaciones(Array.isArray(cuartos) ? cuartos : []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar las reservas.");
    } finally { setCargando(false); }
  };

  useEffect(() => {
    let cancelado = false;
    obtenerDatos().then(([lista, cuartos]) => {
      if (cancelado) return;
      setReservas(Array.isArray(lista) ? lista : []);
      setHabitaciones(Array.isArray(cuartos) ? cuartos : []);
    }).catch((err) => {
      if (!cancelado) setError(err.message || "No se pudieron cargar las reservas.");
    }).finally(() => {
      if (!cancelado) setCargando(false);
    });
    return () => { cancelado = true; };
  }, []);

  const cargarHuespedes = async (id) => {
    setError("");
    try {
      const lista = await api.misReservas.huespedes.lista(id);
      setHuespedes((actual) => ({ ...actual, [id]: Array.isArray(lista) ? lista : [] }));
    } catch (err) { setError(err.message || "No se pudieron cargar los acompañantes."); }
  };

  const crear = async (event) => {
    event.preventDefault(); setError(""); setExito(""); setGuardando(true);
    try {
      await api.misReservas.crear({
        id_habitacion: Number(form.id_habitacion),
        fecha_entrada: form.fecha_entrada,
        fecha_salida: form.fecha_salida,
        cantidad_huespedes: Number(form.cantidad_huespedes),
        observaciones: form.observaciones,
      });
      setForm(NUEVA); setExito("Reserva creada en estado pendiente."); await cargar();
    } catch (err) { setError(err.message || "No se pudo crear la reserva."); }
    finally { setGuardando(false); }
  };

  const guardarEdicion = async (event, id) => {
    event.preventDefault(); setError(""); setExito(""); setGuardando(true);
    try {
      await api.misReservas.actualizar(id, {
        id_habitacion: Number(edicion.id_habitacion),
        fecha_entrada: edicion.fecha_entrada,
        fecha_salida: edicion.fecha_salida,
        cantidad_huespedes: Number(edicion.cantidad_huespedes),
        observaciones: edicion.observaciones,
      });
      setEdicion(null); setExito("Reserva actualizada."); await cargar();
    } catch (err) { setError(err.message || "No se pudo actualizar la reserva."); }
    finally { setGuardando(false); }
  };

  const cancelar = async (reserva) => {
    if (!window.confirm(`¿Cancelar la reserva #${reserva.id_reserva}?`)) return;
    setError(""); setExito(""); setGuardando(true);
    try { await api.misReservas.cancelar(reserva.id_reserva); setExito("Reserva cancelada."); await cargar(); }
    catch (err) { setError(err.message || "No se pudo cancelar la reserva."); }
    finally { setGuardando(false); }
  };

  const agregarHuesped = async (event, id) => {
    event.preventDefault(); setError(""); setExito(""); setGuardando(true);
    try {
      await api.misReservas.huespedes.agregar(id, nuevoHuesped);
      setNuevoHuesped(HUESPED_VACIO); setExito("Acompañante agregado."); await cargarHuespedes(id);
    } catch (err) { setError(err.message || "No se pudo agregar el acompañante."); }
    finally { setGuardando(false); }
  };

  const eliminarHuesped = async (idReserva, huesped) => {
    if (!window.confirm(`¿Eliminar a ${huesped.nombres} ${huesped.apellidos} de esta reserva?`)) return;
    setError(""); setGuardando(true);
    try {
      await api.misReservas.huespedes.eliminar(idReserva, huesped.id_huesped);
      await cargarHuespedes(idReserva); setExito("Acompañante eliminado.");
    } catch (err) { setError(err.message || "No se pudo eliminar el acompañante."); }
    finally { setGuardando(false); }
  };

  const actualizarForm = (setter, campo, valor) => setter((actual) => ({ ...actual, [campo]: valor }));
  const habitacionesDisponibles = habitaciones.filter((item) => item.estado === "DISPONIBLE");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Mis reservas</h1>
        <p className="mt-1 text-sm text-zinc-400">Administra tus estadías y sus acompañantes.</p>
      </div>
      {error && <Alert variant="error">{error}</Alert>}
      {exito && <Alert variant="success">{exito}</Alert>}

      <Card className="p-6">
        <h2 className="text-lg font-medium text-white">Solicitar una reserva</h2>
        <p className="mb-4 mt-1 text-sm text-zinc-400">El total se calcula con la tarifa por noche. La solicitud queda pendiente de confirmación.</p>
        <form onSubmit={crear} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Habitación disponible *" required value={form.id_habitacion} onChange={(e) => actualizarForm(setForm, "id_habitacion", e.target.value)}>
              <option value="">Seleccione una habitación</option>
              {habitacionesDisponibles.map((h) => <option key={h.id_habitacion} value={h.id_habitacion}>Habitación {h.numero} · {h.tipo || h.nombre_tipo || `Tipo ${h.id_tipo_habitacion}`}</option>)}
            </Select>
            <Input label="Cantidad de huéspedes *" type="number" min="1" required value={form.cantidad_huespedes} onChange={(e) => actualizarForm(setForm, "cantidad_huespedes", e.target.value)} />
            <Input label="Fecha de entrada *" type="date" required value={form.fecha_entrada} onChange={(e) => actualizarForm(setForm, "fecha_entrada", e.target.value)} />
            <Input label="Fecha de salida *" type="date" required value={form.fecha_salida} onChange={(e) => actualizarForm(setForm, "fecha_salida", e.target.value)} />
          </div>
          <Input label="Observaciones" maxLength={255} value={form.observaciones} onChange={(e) => actualizarForm(setForm, "observaciones", e.target.value)} />
          <Button type="submit" loading={guardando} disabled={!habitacionesDisponibles.length}>Solicitar reserva</Button>
          {!habitacionesDisponibles.length && <p className="text-sm text-amber-300">No hay habitaciones marcadas como disponibles.</p>}
        </form>
      </Card>

      <section className="space-y-4" aria-labelledby="reservas-titulo">
        <h2 id="reservas-titulo" className="text-lg font-medium text-white">Tus reservas</h2>
        {cargando ? <p className="text-sm text-zinc-400">Cargando reservas…</p> : null}
        {!cargando && reservas.length === 0 ? <Card className="p-6 text-sm text-zinc-400">Aún no tienes reservas.</Card> : null}
        {reservas.map((reserva) => {
          const editable = reserva.estado === "PENDIENTE";
          const cancelable = ["PENDIENTE", "CONFIRMADA"].includes(reserva.estado);
          return <Card key={reserva.id_reserva} className="space-y-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-medium text-white">Reserva #{reserva.id_reserva} · Habitación {reserva.numero || reserva.id_habitacion}</h3>
                <p className="mt-1 text-sm text-zinc-400">{String(reserva.fecha_entrada).slice(0,10)} — {String(reserva.fecha_salida).slice(0,10)} · {reserva.cantidad_huespedes} huésped(es)</p>
                <p className="mt-1 text-sm text-zinc-400">Estado: {reserva.estado} · Total: {Number(reserva.total).toLocaleString("es-CO", { style: "currency", currency: "COP" })}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => { const next = abierta === reserva.id_reserva ? null : reserva.id_reserva; setAbierta(next); if (next && !huespedes[next]) cargarHuespedes(next); }}>Acompañantes</Button>
                {editable && <Button variant="secondary" size="sm" onClick={() => setEdicion(edicion?.id === reserva.id_reserva ? null : { id: reserva.id_reserva, ...datosEdicion(reserva) })}>Modificar</Button>}
                {cancelable && <Button variant="danger" size="sm" loading={guardando} onClick={() => cancelar(reserva)}>Cancelar</Button>}
              </div>
            </div>
            {edicion?.id === reserva.id_reserva && <form onSubmit={(e) => guardarEdicion(e, reserva.id_reserva)} className="grid gap-3 border-t border-zinc-800 pt-4 sm:grid-cols-2">
              <Select label="Habitación" value={edicion.id_habitacion} onChange={(e) => actualizarForm(setEdicion, "id_habitacion", e.target.value)}>{habitaciones.map((h) => <option key={h.id_habitacion} value={h.id_habitacion}>Habitación {h.numero}</option>)}</Select>
              <Input label="Cantidad de huéspedes" type="number" min="1" value={edicion.cantidad_huespedes} onChange={(e) => actualizarForm(setEdicion, "cantidad_huespedes", e.target.value)} />
              <Input label="Entrada" type="date" value={edicion.fecha_entrada} onChange={(e) => actualizarForm(setEdicion, "fecha_entrada", e.target.value)} />
              <Input label="Salida" type="date" value={edicion.fecha_salida} onChange={(e) => actualizarForm(setEdicion, "fecha_salida", e.target.value)} />
              <Input label="Observaciones" maxLength={255} value={edicion.observaciones} onChange={(e) => actualizarForm(setEdicion, "observaciones", e.target.value)} />
              <div className="flex items-end gap-2"><Button type="submit" loading={guardando}>Guardar</Button><Button type="button" variant="ghost" onClick={() => setEdicion(null)}>Cerrar</Button></div>
            </form>}
            {abierta === reserva.id_reserva && <div className="space-y-4 border-t border-zinc-800 pt-4">
              <h4 className="font-medium text-white">Acompañantes</h4>
              {(huespedes[reserva.id_reserva] || []).length === 0 ? <p className="text-sm text-zinc-400">No hay acompañantes registrados.</p> : <ul className="space-y-2">{huespedes[reserva.id_reserva].map((h) => <li key={h.id_huesped} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-zinc-900 px-3 py-2 text-sm"><span className="text-zinc-200">{h.nombres} {h.apellidos} · Documento {h.documento}</span>{!['CANCELADA', 'FINALIZADA'].includes(reserva.estado) && <Button variant="danger" size="sm" loading={guardando} onClick={() => eliminarHuesped(reserva.id_reserva, h)}>Quitar</Button>}</li>)}</ul>}
              {!['CANCELADA', 'FINALIZADA'].includes(reserva.estado) && <form onSubmit={(e) => agregarHuesped(e, reserva.id_reserva)} className="grid gap-3 sm:grid-cols-2">
                <Input label="Nombres *" required value={nuevoHuesped.nombres} onChange={(e) => actualizarForm(setNuevoHuesped, "nombres", e.target.value)} />
                <Input label="Apellidos *" required value={nuevoHuesped.apellidos} onChange={(e) => actualizarForm(setNuevoHuesped, "apellidos", e.target.value)} />
                <Input label="Documento *" required value={nuevoHuesped.documento} onChange={(e) => actualizarForm(setNuevoHuesped, "documento", e.target.value)} />
                <Input label="Teléfono" value={nuevoHuesped.telefono} onChange={(e) => actualizarForm(setNuevoHuesped, "telefono", e.target.value)} />
                <Input label="Correo" type="email" value={nuevoHuesped.correo} onChange={(e) => actualizarForm(setNuevoHuesped, "correo", e.target.value)} />
                <Input label="Nacionalidad" value={nuevoHuesped.nacionalidad} onChange={(e) => actualizarForm(setNuevoHuesped, "nacionalidad", e.target.value)} />
                <div className="sm:col-span-2"><Button type="submit" loading={guardando}>Agregar acompañante</Button></div>
              </form>}
            </div>}
          </Card>;
        })}
      </section>
    </div>
  );
}
