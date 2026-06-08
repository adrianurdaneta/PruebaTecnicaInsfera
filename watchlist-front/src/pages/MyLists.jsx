import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import EditListModal from '../components/EditListModal'

import { useNavigate } from 'react-router-dom'

export default function MyLists() {
  const { user } = useAuth()
  const [lists, setLists] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editing, setEditing] = useState(null)
  const [, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchLists = async () => {
    if (!user) {
      setLists([])
      return
    }
    try {
      const res = await api.get('/watchlist')
      setLists(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const navigate = useNavigate()

  useEffect(() => {
    // llamar fetchLists en efecto para evitar setState en render
    const t = setTimeout(() => fetchLists(), 0)
    return () => clearTimeout(t)
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/watchlist', { name, description })
      setName('')
      setDescription('')
      await fetchLists()
    } catch (err) {
      console.error(err)
      setError('Could not create list')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this list?')) return
    try {
      await api.delete(`/watchlist/${id}`)
      await fetchLists()
    } catch (err) {
      console.error(err)
    }
  }

  const startEdit = (list) => {
    setEditing(list)
  }

  const submitEdit = async () => {
    if (!editing) return
    try {
      await api.put(`/watchlist/${editing.id}`, { name: editing.name, description: editing.description })
      setEditing(null)
      await fetchLists()
    } catch (err) {
      console.error(err)
      setError('Could not update list')
    }
  }

  const handleEditChange = (updated) => setEditing(updated)

  return (
    <div className="container py-4">
      <h2>My Lists</h2>
      <p className="text-muted">Manage your watchlists</p>

      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleCreate} className="row g-2">
            <div className="col-12 col-md-5">
              <input className="form-control" placeholder="List name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="col-12 col-md-5">
              <input className="form-control" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="col-12 col-md-2 d-grid">
              <button className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
            </div>
          </form>
        </div>
      </div>

      <div className="row g-3">
        {lists.length === 0 ? (
          <div className="col-12">
            <div className="card p-4 skeleton" style={{ height: '120px' }} />
          </div>
        ) : lists.map((l) => (
          <div className="col-12 col-md-6" key={l.id}>
            <div className="card">
              <div className="card-body d-flex justify-content-between align-items-start gap-3">
                <div>
                  <h5 className="mb-1">{l.name}</h5>
                  <p className="mb-1 text-muted">{l.description}</p>
                  <small className="text-muted">{l.items?.length || 0} items</small>
                </div>
                <div className="d-flex flex-column gap-2">
                  <button className="btn btn-outline-secondary" onClick={() => navigate('/home', { state: { listId: l.id } })}>View</button>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(l)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(l.id)}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EditListModal
          list={editing}
          onClose={() => setEditing(null)}
          onChange={handleEditChange}
          onSave={submitEdit}
        />
      )}
    </div>
  )
}
