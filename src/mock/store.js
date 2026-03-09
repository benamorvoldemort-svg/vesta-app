export const BOOKING_STATUS = { REQUESTED:'Requested', ASSIGNED:'Assigned', IN_PROGRESS:'InProgress', COMPLETED:'Completed' }
export const USER_ROLES = { CLIENT:'client', WORKER:'worker', ADMIN:'admin' }
export const APPROVAL_STATUS = { PENDING:'pending', APPROVED:'approved', REJECTED:'rejected' }

export const DEMO_USERS = {
  'client-001': { uid:'client-001', email:'client@vesta.app', displayName:'Alex Côté', role:'client', approvalStatus:'approved' },
  'worker-001': { uid:'worker-001', email:'worker@vesta.app', displayName:'Marie Bolduc', role:'worker', approvalStatus:'approved' },
  'worker-002': { uid:'worker-002', email:'worker2@vesta.app', displayName:'Jean Tremblay', role:'worker', approvalStatus:'pending' },
  'admin-001':  { uid:'admin-001',  email:'admin@vesta.app',  displayName:'Admin Vesta',  role:'admin',  approvalStatus:'approved' },
}

let bookings = [
  { id:'book-001', clientId:'client-001', workerId:null, status:'Requested', address:'400 rue des Seigneurs', postalCode:'H3J 1X8', size:'4½', extras:['fridge','windows'], price:179, date:'2025-06-15', time:'10:00', photosBefore:[], photosAfter:[], createdAt:new Date(Date.now()-5*60000) },
  { id:'book-002', clientId:'client-001', workerId:'worker-001', status:'Assigned', address:'185 rue Wellington O.', postalCode:'H3C 1V4', size:'3½', extras:[], price:109, date:'2025-06-10', time:'14:00', photosBefore:[], photosAfter:[], createdAt:new Date(Date.now()-2*3600000) },
  { id:'book-003', clientId:'client-001', workerId:'worker-001', status:'Completed', address:'300 rue Notre-Dame O.', postalCode:'H2Y 1T9', size:'5½', extras:['oven','petHair'], price:199, date:'2025-06-01', time:'09:00', photosBefore:[], photosAfter:[], createdAt:new Date(Date.now()-7*86400000) },
  { id:'book-004', clientId:'other-client', workerId:null, status:'Requested', address:'800 av. Atwater', postalCode:'H4C 2R4', size:'Studio', extras:[], price:89, date:'2025-06-16', time:'09:00', photosBefore:[], photosAfter:[], createdAt:new Date(Date.now()-12*60000) },
  { id:'book-005', clientId:'other-client-2', workerId:null, status:'Requested', address:'1000 rue Saint-Patrick', postalCode:'H3C 1A3', size:'3½', extras:['fridge'], price:124, date:'2025-06-16', time:'13:00', photosBefore:[], photosAfter:[], createdAt:new Date(Date.now()-3*60000) },
]

const listeners = {}
let listenerId = 0

function getData(channel, filter) {
  if (channel==='bookings:available') return bookings.filter(b=>b.status==='Requested').sort((a,b)=>b.createdAt-a.createdAt)
  if (channel==='bookings:client') return bookings.filter(b=>b.clientId===filter).sort((a,b)=>b.createdAt-a.createdAt)
  if (channel==='bookings:worker-active') return bookings.filter(b=>b.workerId===filter&&['Assigned','InProgress'].includes(b.status))[0]||null
  if (channel==='bookings:all') return [...bookings].sort((a,b)=>b.createdAt-a.createdAt)
  if (channel==='workers:all') return Object.values(DEMO_USERS).filter(u=>u.role==='worker')
  return null
}

function notify(channel) {
  Object.values(listeners).forEach(l=>{ if(l.channel===channel) l.cb(getData(channel,l.filter)) })
}

function subscribe(channel, filter, cb) {
  const id = ++listenerId
  listeners[id] = { channel, filter, cb }
  setTimeout(()=>cb(getData(channel,filter)),0)
  return ()=>delete listeners[id]
}

let currentUser = null
const authCbs = []
export function onAuthChange(cb) { authCbs.push(cb); setTimeout(()=>cb(currentUser),0); return ()=>authCbs.splice(authCbs.indexOf(cb),1) }
export async function loginUser(email) {
  const user = Object.values(DEMO_USERS).find(u=>u.email===email)
  if(!user) throw new Error('Compte non trouvé. Utilise un compte démo.')
  currentUser=user; authCbs.forEach(cb=>cb(user)); return user
}
export async function registerUser(email,password,role,displayName) {
  const uid=`user-${Date.now()}`
  const user={uid,email,displayName,role,approvalStatus:role==='worker'?'pending':'approved'}
  DEMO_USERS[uid]=user; currentUser=user; authCbs.forEach(cb=>cb(user)); notify('workers:all'); return user
}
export async function logoutUser() { currentUser=null; authCbs.forEach(cb=>cb(null)) }
export async function getUserProfile(uid) { return DEMO_USERS[uid]||null }

export function listenAvailableBookings(cb) { return subscribe('bookings:available',null,cb) }
export function listenClientBookings(clientId,cb) { return subscribe('bookings:client',clientId,cb) }
export function listenWorkerActiveBooking(workerId,cb) { return subscribe('bookings:worker-active',workerId,cb) }
export function listenAllBookings(cb) { return subscribe('bookings:all',null,cb) }
export function listenWorkers(cb) { return subscribe('workers:all',null,cb) }

export async function createBooking(clientId,data) {
  const id=`book-${Date.now()}`
  bookings.unshift({id,clientId,workerId:null,status:'Requested',...data,photosBefore:[],photosAfter:[],createdAt:new Date()})
  notify('bookings:available'); notify('bookings:client'); notify('bookings:all')
  return {id}
}
export async function acceptBooking(bookingId,workerId) {
  const b=bookings.find(b=>b.id===bookingId)
  if(b){b.workerId=workerId;b.status='Assigned'}
  notify('bookings:available'); notify('bookings:worker-active'); notify('bookings:all')
}
export async function startBooking(bookingId) {
  const b=bookings.find(b=>b.id===bookingId); if(b) b.status='InProgress'
  notify('bookings:worker-active'); notify('bookings:client'); notify('bookings:all')
}
export async function completeBooking(bookingId) {
  const b=bookings.find(b=>b.id===bookingId); if(b) b.status='Completed'
  notify('bookings:worker-active'); notify('bookings:client'); notify('bookings:all')
}
export async function updateBookingPhotos(bookingId,field,urls) {
  const b=bookings.find(b=>b.id===bookingId); if(b) b[field]=urls
  notify('bookings:worker-active')
}
export async function adminUpdateStatus(bookingId,status) {
  const b=bookings.find(b=>b.id===bookingId); if(b) b.status=status
  notify('bookings:all'); notify('bookings:client'); notify('bookings:available')
}
export async function updateWorkerApproval(uid,status) {
  if(DEMO_USERS[uid]) DEMO_USERS[uid].approvalStatus=status; notify('workers:all')
}
export async function createCheckoutSession() {
  return new Promise(resolve=>setTimeout(()=>resolve({success:true}),1200))
}
