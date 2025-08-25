import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Users, Trash2, Edit, Save, X } from 'lucide-react';
import apiService from '../services/api';

const TeamManager = () => {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamForm, setTeamForm] = useState({ name: '', memberIds: [], leadId: '' });
  const [membersDropdownOpen, setMembersDropdownOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      let teamsData = [];
      let usersData = [];
      try {
        teamsData = await apiService.getTeams();
      } catch (e) {
        throw e;
      }
      try {
        usersData = await apiService.getUsers();
      } catch (e) {
        // Fallback directo si falla la llamada con token
        try {
          const res = await fetch('http://localhost:3001/users');
          if (res.ok) {
            usersData = await res.json();
          } else {
            throw e;
          }
        } catch (fallbackErr) {
          throw e;
        }
      }
      setTeams(teamsData || []);
      setUsers(usersData || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

  const resetForm = () => {
    setEditingTeam(null);
    setTeamForm({ name: '', memberIds: [], leadId: '' });
    setFormOpen(false);
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name || '',
      memberIds: team.memberIds || [],
      leadId: team.leadId || '',
    });
    setFormOpen(true);
  };

  const getMembersLabel = () => {
    const ids = teamForm.memberIds || [];
    if (ids.length === 0) return 'Selecciona miembros';
    const names = ids
      .map(id => userMap.get(id)?.name)
      .filter(Boolean);
    if (names.length === 0) return `${ids.length} seleccionados`;
    return names.join(', ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const payload = {
        name: teamForm.name.trim(),
        memberIds: teamForm.memberIds,
        leadId: teamForm.leadId || null,
      };
      if (editingTeam) {
        await apiService.updateTeam(editingTeam.id, payload);
      } else {
        await apiService.createTeam(payload);
      }
      await loadData();
      resetForm();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (team) => {
    if (!window.confirm(`¿Eliminar equipo "${team.name}"?`)) return;
    try {
      setLoading(true);
      await apiService.deleteTeam(team.id);
      await loadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gestión de Equipos</h3>
        <button
          onClick={async () => {
            setFormOpen(true);
            setEditingTeam(null);
            setTeamForm({ name: '', memberIds: [], leadId: '' });
            if (users.length === 0) {
              await loadData();
            }
          }}
          className="inline-flex items-center px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Equipo
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-soft border border-gray-100 dark:border-gray-700 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre del equipo</label>
            <input
              type="text"
              required
              value={teamForm.name}
              onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Miembros</label>
            <button
              type="button"
              onClick={() => setMembersDropdownOpen(prev => !prev)}
              className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <span className="text-sm">{getMembersLabel()}</span>
              <svg className={`w-4 h-4 transform transition-transform ${membersDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
            </button>
            {membersDropdownOpen && (
              <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg p-2 custom-scrollbar">
                {users.map(u => (
                  <label key={u.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-1 px-1 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={teamForm.memberIds.includes(u.id)}
                      onChange={() => {
                        setTeamForm(prev => {
                          const selected = new Set(prev.memberIds);
                          if (selected.has(u.id)) {
                            selected.delete(u.id);
                          } else {
                            selected.add(u.id);
                          }
                          const next = Array.from(selected);
                          // Si el líder ya no es miembro, limpiarlo
                          const nextLead = next.includes(prev.leadId) ? prev.leadId : '';
                          return { ...prev, memberIds: next, leadId: nextLead };
                        });
                      }}
                    />
                    {u.name} ({u.email})
                  </label>
                ))}
                <div className="flex items-center justify-end mt-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMembersDropdownOpen(false)}
                    className="px-3 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded"
                  >
                    Listo
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Líder (opcional)</label>
            <select
              value={teamForm.leadId || ''}
              onChange={(e) => setTeamForm(prev => ({ ...prev, leadId: e.target.value ? parseInt(e.target.value) : '' }))}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Sin líder</option>
              {teamForm.memberIds.map(id => (
                <option key={id} value={id}>{userMap.get(id)?.name || `Usuario ${id}`}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={resetForm} className="inline-flex items-center px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors">
              <X className="w-4 h-4 mr-2" /> Cancelar
            </button>
            <button type="submit" className="inline-flex items-center px-3 py-2 bg-success-600 hover:bg-success-700 text-white text-sm font-medium rounded-lg transition-colors">
              {editingTeam ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />} {editingTeam ? 'Guardar cambios' : 'Crear equipo'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-soft border border-gray-100 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center"><Users className="w-4 h-4 mr-2" /> Equipos</h4>
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Cargando…</p>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : teams.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No hay equipos creados.</p>
        ) : (
          <div className="space-y-3">
            {teams.map(team => (
              <div key={team.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">{team.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Miembros: {team.memberIds?.length || 0}{team.leadId ? ` • Líder: ${userMap.get(team.leadId)?.name || team.leadId}` : ''}
                    </p>
                    {Array.isArray(team.memberIds) && team.memberIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(() => {
                          const ids = Array.from(team.memberIds || []);
                          if (team.leadId) {
                            const leadIndex = ids.indexOf(team.leadId);
                            if (leadIndex > -1) {
                              ids.splice(leadIndex, 1);
                              ids.unshift(team.leadId);
                            }
                          }
                          return ids;
                        })().map(id => {
                          const u = userMap.get(id);
                          if (!u) return null;
                          const isLead = team.leadId && team.leadId === id;
                          return (
                            <span
                              key={id}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${isLead ? 'border-primary-300 text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700'}`}
                            >
                              {u.name}{isLead ? ' • Líder' : ''}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <button onClick={() => handleEdit(team)} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(team)} className="p-2 text-red-600 hover:text-red-700 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManager;


