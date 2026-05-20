import { useNavigate, useParams } from 'react-router';
import { ThemeDetail } from '~/materialidade/theme';

export default function TemaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const themeId = Number(id);

  if (!themeId) return null;

  return (
    <ThemeDetail
      themeId={themeId}
      onPickTheme={newId => navigate(`/materialidade/tema/${newId}`)}
      onBack={() => navigate('/materialidade')}
    />
  );
}
