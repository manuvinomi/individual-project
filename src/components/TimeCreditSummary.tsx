import { Card, CardContent, Typography } from "@mui/material";

// Define props interface
interface TimeCreditSummaryProps {
  earned: number;
  spent: number;
  balance: number;
}

const TimeCreditSummary: React.FC<TimeCreditSummaryProps> = ({ earned, spent, balance }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent>
          <Typography variant="h6">Time Credits Earned</Typography>
          <Typography variant="h4">{earned} hrs</Typography>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6">Time Credits Spent</Typography>
          <Typography variant="h4">{spent} hrs</Typography>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6">Balance</Typography>
          <Typography variant="h4">{balance} hrs</Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeCreditSummary;

