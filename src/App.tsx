import React, { useState, useEffect } from 'react';
import { PlusCircle, CheckCircle, Circle, Trash2, Calendar, Moon, Sun, LogOut } from 'lucide-react';
import { supabase } from './supabase';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { Auth } from './pages/Auth';

interface Task {
  id: string;
  name: string;
  completed: boolean;
  created_at: string;
  user_id: string;
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut, loading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .insert([
          {
            name: newTask,
            completed: false,
            user_id: user.id
          },
        ]);

      if (error) throw error;
      
      setNewTask('');
      loadTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', taskId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900'
    } py-12 px-4 sm:px-6`}>
      <div className="max-w-3xl mx-auto">
        <div className={`${
          theme === 'dark' 
            ? 'bg-gray-800/50'
            : 'bg-white/10'
        } backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20`}>
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold text-white">
                Task Master
              </h1>
              <span className="text-white/50 text-sm">
                {user.email}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => signOut()}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-6 h-6 text-yellow-400" />
                ) : (
                  <Moon className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>

          <form onSubmit={addTask} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="What needs to be done?"
                className={`flex-1 ${
                  theme === 'dark'
                    ? 'bg-gray-700/50 border-gray-600'
                    : 'bg-white/5 border-white/10'
                } border rounded-xl px-6 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
              />
              <button
                type="submit"
                className={`${
                  theme === 'dark'
                    ? 'bg-purple-700 hover:bg-purple-600'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white px-6 py-4 rounded-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95`}
              >
                <PlusCircle size={20} />
                Add Task
              </button>
            </div>
          </form>

          <div className="flex gap-4 mb-6">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  filter === f
                    ? theme === 'dark'
                      ? 'bg-purple-700 text-white'
                      : 'bg-purple-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700/50 text-white/70 hover:bg-gray-600/50'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`group ${
                  theme === 'dark'
                    ? 'bg-gray-700/30 hover:bg-gray-700/50'
                    : 'bg-white/5 hover:bg-white/10'
                } rounded-xl p-4 flex items-center gap-4 transition-all ${
                  task.completed ? 'opacity-70' : ''
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="text-white/80 hover:text-purple-400 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>
                
                <div className="flex-1">
                  <p className={`text-white text-lg ${
                    task.completed ? 'line-through text-white/50' : ''
                  }`}>
                    {task.name}
                  </p>
                  <div className="flex items-center gap-4 text-white/50 text-sm mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(task.created_at)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-white/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}

            {filteredTasks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-white/50 text-lg">No tasks found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;