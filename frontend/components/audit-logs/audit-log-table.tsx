'use client'
import { AuditLog } from '@/types'

export default function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Date</th>
            <th className="text-left py-3 px-4">User</th>
            <th className="text-left py-3 px-4">Action</th>
            <th className="text-left py-3 px-4">Entity</th>
            <th className="text-left py-3 px-4">Entity ID</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">{new Date(log.createdAt).toLocaleDateString('id-ID')}</td>
              <td className="py-3 px-4">{log.user?.name || log.user?.email || '-'}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                  log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                  log.action === 'DELETE' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>{log.action}</span>
              </td>
              <td className="py-3 px-4">{log.entityType}</td>
              <td className="py-3 px-4">{log.entityId}</td>
            </tr>
          ))}
          {logs.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-500">No audit logs</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
