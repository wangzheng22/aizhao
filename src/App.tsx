import { useCallback, useState } from 'react';
import { DocumentPreparationPage } from './pages/DocumentPreparationPage';
import { FileUploadParsePage } from './pages/FileUploadParsePage';
import { ProjectListPage } from './pages/ProjectListPage';
import type { ProjectListItem } from './types/projectList';
import type { DocumentPreparationEntry } from './types/documentWorkflow';
import { projectListMock } from './data/projectListMock';
import { buildEntryFromProjectListItem, projectListItemToForm } from './utils/projectListToForm';

type AppView = 'list' | 'upload' | 'review';

function App() {
  const [view, setView] = useState<AppView>('list');
  const [reviewEntry, setReviewEntry] = useState<DocumentPreparationEntry | null>(null);
  const [activeProject, setActiveProject] = useState<ProjectListItem | null>(null);

  const handleOpenProject = useCallback((item: ProjectListItem) => {
    setActiveProject(item);
    if (item.hasGeneratedDocument) {
      setReviewEntry(buildEntryFromProjectListItem(item));
      setView('review');
      return;
    }
    setReviewEntry(null);
    setView('upload');
  }, []);

  const handleCreateNew = useCallback(() => {
    setActiveProject(null);
    setReviewEntry(null);
    setView('upload');
  }, []);

  const handleStartReview = useCallback(() => {
    const item =
      projectListMock.find((row) => row.hasGeneratedDocument) ?? projectListMock[0] ?? null;
    if (!item) return;
    setActiveProject(item);
    setReviewEntry(buildEntryFromProjectListItem(item));
    setView('review');
  }, []);

  const handleGenerateDocument = useCallback((entry: DocumentPreparationEntry) => {
    setReviewEntry(entry);
    setView('review');
  }, []);

  const handleBackToList = useCallback(() => {
    setView('list');
    setReviewEntry(null);
    setActiveProject(null);
  }, []);

  if (view === 'list') {
    return (
      <ProjectListPage
        onOpenProject={handleOpenProject}
        onCreateNew={handleCreateNew}
        onStartReview={handleStartReview}
      />
    );
  }

  if (view === 'review' && reviewEntry) {
    return <DocumentPreparationPage entry={reviewEntry} onBackToList={handleBackToList} />;
  }

  return (
    <FileUploadParsePage
      initialProjectForm={activeProject ? projectListItemToForm(activeProject) : undefined}
      headerTitle={activeProject?.projectName}
      onBackToList={handleBackToList}
      onGenerateDocument={handleGenerateDocument}
    />
  );
}

export default App;
