import Typography from '@tecton-mui/ui/Typography';

export default function SemanticHeadings() {
  return (
    <div>
      {/* Visual size h4, document outline level 2 */}
      <Typography variant="h4" component="h2" gutterBottom>
        Quarterly report
      </Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>
        Production increased in all regions except the Barents Sea.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Last updated by the data platform team.
      </Typography>
    </div>
  );
}
