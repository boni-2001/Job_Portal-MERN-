import { Container } from '@mui/material';
export default function PageContainer({ children, maxWidth = 'lg' }) {
  return <Container maxWidth={maxWidth} sx={{ py: 4 }}>{children}</Container>;
}
