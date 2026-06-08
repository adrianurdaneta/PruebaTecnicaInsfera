export default function EditListModal({ list, onClose, onChange, onSave }) {
  if (!list) return null
  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit list</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input className="form-control" value={list.name} onChange={(e) => onChange({ ...list, name: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea className="form-control" value={list.description} onChange={(e) => onChange({ ...list, description: e.target.value })} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={onSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
