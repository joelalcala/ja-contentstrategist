import { useState, useEffect } from 'react'
import { SupabaseApi } from '@/lib/api'

interface Project {
  id: string
  name: string
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      const supabaseApi = new SupabaseApi()
      const { data, error } = await supabaseApi.getProjects()
      if (data) {
        setProjects(data)
        if (data.length > 0) {
          setSelectedProject(data[0])
        }
      }
    }
    fetchProjects()
  }, [])

  const selectProject = (project: Project) => {
    setSelectedProject(project)
  }

  return { projects, selectedProject, selectProject }
}

