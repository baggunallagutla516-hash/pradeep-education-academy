export function pathForJoin(data, basePath = '/quizzes') {
  const id = data.id || data.quizId;
  const kind = data.kind || (data.playMode === 'classroom' ? 'classroom' : 'quiz');
  if (kind === 'classroom') return `${basePath}/${id}/classroom`;
  if (kind === 'quiz') return `${basePath}/${id}`;
  if (kind === 'assessment') return `/assessments/${id}/attempt`;
  if (kind === 'dpp') return `/dpps/${id}/attempt`;
  if (kind === 'slipTest') {
    return data.contentMode === 'file' ? `/slip-tests/${id}` : `/slip-tests/${id}/attempt`;
  }
  if (kind === 'cet') return `/cets/${id}`;
  if (kind === 'unitTest') return `/unit-tests/${id}`;
  if (kind === 'worksheet') return `/worksheets/${id}`;
  return `${basePath}/${id}`;
}
