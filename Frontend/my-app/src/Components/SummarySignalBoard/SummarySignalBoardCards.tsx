import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { CardType, SummaryData } from './types';

interface SummarySignalBoardCardsProps {
  data: SummaryData;
  onCardClick: (type: CardType) => void;
}

interface CardConfig {
  id: CardType;
  title: string;
  count: number;
  icon: React.ElementType;
  color: string;
}

const SummarySignalBoardCards: React.FC<SummarySignalBoardCardsProps> = ({
  data,
  onCardClick,
}) => {
  const theme = useTheme();

  const cards: CardConfig[] = [
    {
      id: 'upcoming',
      title: 'Upcoming IPOs',
      count: data.upcoming_deals.count,
      icon: TrendingUpIcon,
      color: 'primary',
    },
    {
      id: 'portfolio',
      title: 'Trading IPOs',
      count: data.current_portfolio_deals.count,
      icon: WorkIcon,
      color: 'success',
    },
    {
      id: 'recent',
      title: 'Recently Listed',
      count: data.recently_traded_deals.count,
      icon: ScheduleIcon,
      color: 'warning',
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Grid item xs={12} sm={6} md={3} key={card.id}>
            <Card
              onClick={() => onCardClick(card.id)}
              sx={{
                cursor: 'pointer',
                height: '100%',
                transition: 'all 0.3s ease',
                border: '1px solid',
                borderColor: theme.palette.divider,
                '&:hover': {
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Icon
                    sx={{
                      fontSize: 20,
                      color: `${card.color}.main`,
                    }}
                  />
                </div>

                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    color: theme.palette.text.secondary,
                    textTransform: 'uppercase',
                    mb: 1,
                    display: 'block',
                  }}
                >
                  {card.title}
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    fontSize: '2rem',
                  }}
                >
                  {card.count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default SummarySignalBoardCards;
