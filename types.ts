
export interface Movie {
  id: string;
  title: string;
  poster: string;
  banner: string;
  rating: string;
  genre: string[];
  duration: string;
  description: string;
  releaseDate: string;
  director: string;
  cast: string[];
  popularity: number;
}

export interface Theater {
  id: string;
  name: string;
  address: string;
  distance: string;
  amenities: string[];
}

export interface ShowTime {
  id: string;
  theaterId: string;
  movieId: string;
  time: string;
  format: '2D' | '3D' | 'IMAX' | 'Dolby Cinema';
  price: number;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  isOccupied: boolean;
  type: 'standard' | 'premium';
}

export interface BookingState {
  movie: Movie | null;
  theater: Theater | null;
  showTime: ShowTime | null;
  selectedSeats: string[];
}
