'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SupabaseApi } from '@/lib/api/supabase/supabaseApi';
import { Project } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast, Toast } from '@/components/ui/use-toast';

export default function ProjectDetailsPage({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabaseApi = new SupabaseApi();

  const isNewProject = params.projectId === 'new';

  useEffect(() => {
    if (!isNewProject) {
      fetchProject();
    }
  }, [params.projectId, isNewProject]);

  async function fetchProject() {
    setIsLoading(true);
    const { data, error } = await supabaseApi.getProject(params.projectId);
    setIsLoading(false);
    if (error) {
      showToast({
        message: 'Failed to fetch project details',
        type: 'error',
      });
    } else if (data) {
      setProject(data);
      setName(data.name);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const projectData = { name };
    let result;

    if (isNewProject) {
      result = await supabaseApi.createProject(name);
    } else {
      result = await supabaseApi.updateProject(params.projectId, projectData);
    }

    setIsLoading(false);

    if (result.error) {
      showToast({
        message: `Failed to ${isNewProject ? 'create' : 'update'} project`,
        type: 'error',
      });
    } else {
      showToast({
        message: `Project ${isNewProject ? 'created' : 'updated'} successfully`,
        type: 'success',
      });
      router.push('/projects');
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>{isNewProject ? 'Create New Project' : 'Edit Project'}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter project name"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push('/projects')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isNewProject ? 'Create Project' : 'Update Project'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <Toast toast={toast} />
    </div>
  );
}
