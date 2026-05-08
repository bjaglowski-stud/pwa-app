import { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Chip } from '@mui/material';
import { Gavel, Timer, Person } from '@mui/icons-material';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

interface Auction {
  id: number;
  title: string;
  description: string;
  image: string;
  currentBid: number;
  minIncrement: number;
  endTime: Date;
  seller: string;
  bidCount: number;
}

const initialAuctions: Auction[] = [
  {
    id: 1,
    title: 'Vintage Camera Leica M3',
    description: 'Classic 35mm rangefinder camera from 1954 in excellent condition',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400',
    currentBid: 1500,
    minIncrement: 50,
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    seller: 'VintageCollector',
    bidCount: 12
  },
  {
    id: 2,
    title: 'Antique Pocket Watch',
    description: 'Gold-plated pocket watch from the 1920s with original chain',
    image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=400',
    currentBid: 350,
    minIncrement: 25,
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
    seller: 'TimeKeeper',
    bidCount: 8
  },
  {
    id: 3,
    title: 'Vintage Typewriter',
    description: 'Working Remington typewriter from 1950s',
    image: 'https://images.unsplash.com/photo-1520695287272-b2e4d991c135?w=400',
    currentBid: 200,
    minIncrement: 20,
    endTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
    seller: 'RetroOffice',
    bidCount: 5
  },
  {
    id: 4,
    title: 'Vinyl Record Collection',
    description: 'Collection of 50 classic rock vinyl records from the 70s',
    image: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=400',
    currentBid: 450,
    minIncrement: 30,
    endTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
    seller: 'MusicLover',
    bidCount: 15
  },
  {
    id: 5,
    title: 'Antique Oil Painting',
    description: 'Original oil painting landscape from 19th century',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
    currentBid: 2500,
    minIncrement: 100,
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
    seller: 'ArtDealer',
    bidCount: 23
  },
  {
    id: 6,
    title: 'Classic Guitar',
    description: 'Gibson Les Paul Standard 1959 Reissue',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
    currentBid: 3200,
    minIncrement: 100,
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    seller: 'GuitarPro',
    bidCount: 31
  }
];

function formatTimeRemaining(endTime: Date): string {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();

  if (diff <= 0) return 'Zakończona';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}g ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

export default function App() {
  const [auctions, setAuctions] = useState<Auction[]>(initialAuctions);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenDialog = (auction: Auction) => {
    setSelectedAuction(auction);
    setBidAmount(String(auction.currentBid + auction.minIncrement));
  };

  const handleCloseDialog = () => {
    setSelectedAuction(null);
    setBidAmount('');
  };

  const handlePlaceBid = () => {
    if (!selectedAuction) return;

    const amount = parseFloat(bidAmount);
    const minBid = selectedAuction.currentBid + selectedAuction.minIncrement;

    if (isNaN(amount) || amount < minBid) {
      toast.error(`Minimalna kwota to ${minBid} zł`);
      return;
    }

    setAuctions(prev => prev.map(a =>
      a.id === selectedAuction.id
        ? { ...a, currentBid: amount, bidCount: a.bidCount + 1 }
        : a
    ));

    toast.success(`Licytacja złożona: ${amount} zł`);
    handleCloseDialog();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster position="top-center" />

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Typography variant="h3" component="h1" className="mb-2">
            Serwis Aukcyjny
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Aktywne aukcje: {auctions.filter(a => a.endTime > new Date()).length}
          </Typography>
        </div>

        <Grid container spacing={3}>
          {auctions.map(auction => {
            const isEnded = auction.endTime <= new Date();
            const timeRemaining = formatTimeRemaining(auction.endTime);

            return (
              <Grid item xs={12} sm={6} md={4} key={auction.id}>
                <Card className="h-full flex flex-col">
                  <CardMedia
                    component="img"
                    height="200"
                    image={auction.image}
                    alt={auction.title}
                    className="object-cover h-48"
                  />
                  <CardContent className="flex-1 flex flex-col">
                    <Typography variant="h6" component="h2" className="mb-2">
                      {auction.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" className="mb-3 flex-1">
                      {auction.description}
                    </Typography>

                    <div className="flex items-center gap-2 mb-2">
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {auction.seller}
                      </Typography>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Timer fontSize="small" color={isEnded ? 'disabled' : 'primary'} />
                      <Typography variant="body2" color={isEnded ? 'text.disabled' : 'primary'}>
                        {timeRemaining}
                      </Typography>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <Typography variant="body2" color="text.secondary">
                          Aktualna cena
                        </Typography>
                        <Typography variant="h5" color="primary">
                          {auction.currentBid} zł
                        </Typography>
                      </div>
                      <Chip
                        label={`${auction.bidCount} ofert`}
                        size="small"
                        variant="outlined"
                      />
                    </div>

                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Gavel />}
                      onClick={() => handleOpenDialog(auction)}
                      disabled={isEnded}
                    >
                      {isEnded ? 'Zakończona' : 'Licytuj'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </div>

      <Dialog open={!!selectedAuction} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedAuction && (
          <>
            <DialogTitle>Licytuj: {selectedAuction.title}</DialogTitle>
            <DialogContent>
              <div className="mb-4">
                <Typography variant="body2" color="text.secondary" className="mb-1">
                  Aktualna cena
                </Typography>
                <Typography variant="h5" color="primary">
                  {selectedAuction.currentBid} zł
                </Typography>
              </div>

              <div className="mb-4">
                <Typography variant="body2" color="text.secondary" className="mb-1">
                  Minimalna kwota licytacji
                </Typography>
                <Typography variant="h6">
                  {selectedAuction.currentBid + selectedAuction.minIncrement} zł
                </Typography>
              </div>

              <TextField
                fullWidth
                label="Twoja oferta (zł)"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                variant="outlined"
                className="mt-2"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Anuluj</Button>
              <Button onClick={handlePlaceBid} variant="contained" startIcon={<Gavel />}>
                Licytuj
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
