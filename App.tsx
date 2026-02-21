
import React, { useState, useMemo, useEffect } from 'react';

import { ChevronRight, Play, Star, Clock, X, Check, ArrowRight, Ticket, Sparkles, Loader2, CreditCard, ShieldCheck } from 'lucide-react';


import { MOVIES, THEATERS, SHOWTIMES } from './constants';
import { Movie, Theater, ShowTime, BookingState } from './types';
import SeatMap from './components/SeatMap';
import GeminiAssistant from './components/GeminiAssistant';
import PayPalCheckout from './components/PayPalCheckout';

declare global {
  interface ImportMetaEnv {
    readonly VITE_PAYPAL_CLIENT_ID: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const App: React.FC = () => {
  // Load PayPal SDK script
  useEffect(() => {
    const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&components=buttons`;
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);
  
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const [booking, setBooking] = useState<BookingState>({
    movie: null,
    theater: null,
    showTime: null,
    selectedSeats: []
  });
  const [step, setStep] = useState<'browse' | 'seats' | 'payment' | 'checkout'>('browse');

  const handleBookNow = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const startSeatSelection = (theater: Theater, showTime: ShowTime) => {
    setBooking({
      movie: selectedMovie,
      theater,
      showTime,
      selectedSeats: []
    });
    setStep('seats');
    setSelectedMovie(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSeat = (seatId: string) => {
    setBooking(prev => ({
      ...prev,
      selectedSeats: prev.selectedSeats.includes(seatId)
        ? prev.selectedSeats.filter(id => id !== seatId)
        : [...prev.selectedSeats, seatId]
    }));
  };

  const handleConfirmBooking = () => {
    setIsRedirecting(true);
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Simulate a professional redirect/processing delay
    setTimeout(() => {
      setIsRedirecting(false);
    }, 1500);
  };

  const resetFlow = () => {
    setStep('browse');
    setBooking({ movie: null, theater: null, showTime: null, selectedSeats: [] });
    setSelectedMovie(null);
    setIsRedirecting(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentMovieShowtimes = useMemo(() => {
    if (!selectedMovie) return [];
    return SHOWTIMES.filter(s => s.movieId === selectedMovie.id);
  }, [selectedMovie]);

  const totalAmount = useMemo(() => {
    return (booking.showTime?.price || 0) * booking.selectedSeats.length;
  }, [booking.showTime, booking.selectedSeats]);

  const featuredMovie = MOVIES[0];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center">
          <button 
            onClick={resetFlow} 
            className="text-2xl font-black tracking-tighter text-blue-500 cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2 outline-none"
            aria-label="CineNYC Home"
          >
            <Ticket className="w-8 h-8" />
            <span>CINE<span className="text-white">NYC</span></span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {step === 'browse' && (
          <>
            <section className="mb-20 relative rounded-[2.5rem] overflow-hidden aspect-[21/9] min-h-[450px] shadow-2xl border border-white/5 group">
              <img
                src={featuredMovie.banner} 
                alt={featuredMovie.title} 
                className="absolute inset-0 w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-1000" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/1200x450/18181b/3f3f46?text=' + encodeURIComponent(featuredMovie.title);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-12 left-12 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-lg shadow-blue-500/20">
                  Spotlight Release
                </div>
                <h2 className="text-6xl font-black tracking-tight mb-4 uppercase italic">{featuredMovie.title}</h2>
                <p className="text-lg text-zinc-200 mb-8 line-clamp-2 max-w-lg">
                  {featuredMovie.description} Witness the ultimate cinematic journey at CineNYC theaters.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleBookNow(featuredMovie)}
                    className="px-8 py-3.5 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-xl"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Buy Tickets
                  </button>
                </div>
              </div>
            </section>

            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 bg-blue-600 rounded-full" />
                <div>
                  <h3 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                    Now Playing
                  </h3>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <div className="flex flex-col items-end">
                  <span className="text-white text-xl italic font-black">{MOVIES.length}</span>
                  <span>Active Titles</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8 animate-in fade-in duration-500">
              {MOVIES.map(movie => (
                <div key={movie.id} className="group cursor-pointer">
                  <div className="relative aspect-[2/3] rounded-[2.5rem] overflow-hidden mb-5 shadow-2xl border border-white/5 bg-zinc-900">
                    <img 
                      src={movie.poster} 
                      alt={movie.title} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/600x900/18181b/3f3f46?text=' + encodeURIComponent(movie.title);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-4 text-center">
                      <button 
                        onClick={() => handleBookNow(movie)}
                        className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl mb-3 hover:bg-blue-500 transition-all shadow-xl active:scale-95"
                      >
                        Buy Tickets
                      </button>
                    </div>
                    <div className="absolute top-6 left-6 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-[10px] font-black border border-white/10 tracking-[0.2em] uppercase">
                      {movie.rating}
                    </div>
                  </div>
                  <h4 className="font-bold text-base mb-1 group-hover:text-blue-500 transition-colors leading-tight uppercase tracking-tight">{movie.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    <span className="flex items-center gap-1 text-blue-500">
                      <Star className="w-3 h-3 fill-current" />
                      {movie.popularity}%
                    </span>
                    <span>•</span>
                    <span>{movie.genre[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 'seats' && (
          <div className="max-w-5xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => { setStep('browse'); setSelectedMovie(booking.movie); }}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white mb-10 transition-colors bg-zinc-900/50 px-6 py-3 rounded-full border border-white/5"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Showtimes
            </button>
            
            <div className="grid lg:grid-cols-[1fr_360px] gap-16">
              <div>
                <div className="mb-12">
                  <h2 className="text-5xl font-black tracking-tighter mb-4 uppercase italic leading-none">{booking.movie?.title}</h2>
                  <div className="flex items-center gap-6 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> {booking.showTime?.time}</span>
                  </div>
                </div>
                <SeatMap selectedSeats={booking.selectedSeats} onToggleSeat={toggleSeat} />
              </div>

              <div className="space-y-8">
                <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 blur-[80px] -z-10" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-8">Reservation Info</h3>
                  <div className="space-y-8 mb-12">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Tickets</span>
                      <span className="font-black text-white text-xl">
                        {booking.selectedSeats.length || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Seats</span>
                      <div className="flex flex-wrap gap-2 justify-end max-w-[180px]">
                        {booking.selectedSeats.length > 0 ? booking.selectedSeats.map(s => (
                          <span key={s} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-blue-400">{s}</span>
                        )) : <span className="text-zinc-700 italic text-[10px]">None</span>}
                      </div>
                    </div>
                    <div className="pt-8 border-t border-white/5">
                      <span className="block text-[10px] text-blue-500 uppercase font-black tracking-widest mb-2">Total Payable</span>
                      <span className="text-4xl font-black text-white italic">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <button 
                    disabled={booking.selectedSeats.length === 0}
                    onClick={handleConfirmBooking}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-900 disabled:text-zinc-700 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 group"
                  >
                    Confirm Booking
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="max-w-xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {isRedirecting ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                 <Loader2 className="w-16 h-16 animate-spin text-blue-600 mb-8 stroke-[1]" />
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Redirecting...</h2>
                 <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">To Secure Payment Gateway</p>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setStep('seats')}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white mb-10 transition-colors bg-zinc-900/50 px-6 py-3 rounded-full border border-white/5"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Cancel & Change Seats
                </button>
                
                <div className="bg-zinc-950 border border-white/5 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
                  <div className="mb-12 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 border border-white/10">
                        <ShieldCheck className="w-3 h-3 text-blue-500" />
                        Verified Checkout
                      </div>
                      <h2 className="text-4xl font-black tracking-tighter mb-4 uppercase italic leading-none">Complete Booking</h2>
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Order Total</span>
                        <span className="text-6xl font-black text-white italic tracking-tighter">${totalAmount.toFixed(2)}</span>
                      </div>
                  </div>
                  
                  <div className="mb-10 p-8 bg-black border border-white/5 rounded-3xl space-y-4 shadow-inner">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-zinc-600">Feature Movie</span>
                        <span className="text-white italic">{booking.movie?.title}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-zinc-600">Screening</span>
                        <span className="text-zinc-400">{booking.showTime?.time} • {booking.showTime?.format}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest pt-4 border-t border-white/5">
                        <span className="text-zinc-600">Reserved Seats</span>
                        <span className="text-blue-500">{booking.selectedSeats.join(', ')}</span>
                      </div>
                  </div>

                  <PayPalCheckout 
                    amount={totalAmount} 
                    onSuccess={() => setStep('checkout')} 
                    onCancel={() => setStep('seats')}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {step === 'checkout' && (
          <div className="max-w-2xl mx-auto py-20 text-center animate-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-10 border border-blue-500/30 animate-bounce">
              <Check className="w-12 h-12 stroke-[3]" />
            </div>
            <h2 className="text-5xl font-black tracking-tighter mb-4 italic uppercase leading-none">Verified!</h2>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-16 max-w-xs mx-auto">
              Your cinematic journey is confirmed. Scan your mobile pass at the lobby.
            </p>
            
            <div className="bg-zinc-950 border border-white/10 rounded-[3rem] p-0 mb-16 text-left shadow-2xl relative overflow-hidden group">
               <img src={booking.movie?.banner} className="w-full h-40 object-cover opacity-20 group-hover:scale-110 transition-transform duration-1000" onError={(e) => {
                 const target = e.target as HTMLImageElement;
                 if (booking.movie) {
                   target.src = 'https://placehold.co/1200x400/18181b/3f3f46?text=' + encodeURIComponent(booking.movie.title);
                 }
               }} />
               <div className="p-12 -mt-24 relative z-10 flex flex-col sm:flex-row gap-10">
                <img src={booking.movie?.poster} className="w-36 h-52 object-cover rounded-3xl shadow-2xl border border-white/10" onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (booking.movie) {
                    target.src = 'https://placehold.co/300x450/18181b/3f3f46?text=' + encodeURIComponent(booking.movie.title);
                  }
                }} />
                <div className="flex flex-col justify-end pb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-green-400 mb-4 w-fit">
                    Active Reservation
                  </div>
                  <h3 className="text-4xl font-black mb-4 leading-none uppercase italic tracking-tighter">{booking.movie?.title}</h3>
                  <div className="space-y-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    <p>{booking.showTime?.time} • {booking.showTime?.format}</p>
                    <p className="text-blue-500 text-xl mt-4">SEATS {booking.selectedSeats.join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={resetFlow} className="px-12 py-5 bg-white text-black rounded-full font-black text-[11px] tracking-[0.3em] transition-all uppercase flex items-center gap-3 mx-auto hover:bg-blue-600 hover:text-white group">
              Back to Catalog
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </main>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/98 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-6xl bg-zinc-950 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/5 animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setSelectedMovie(null)}
              className="absolute top-10 right-10 z-30 p-4 bg-black/60 hover:bg-red-500 rounded-full border border-white/10 transition-all hover:scale-110 active:scale-90 shadow-2xl group"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </button>

            <div className="h-[90vh] lg:h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="relative h-64 md:h-[450px] w-full group">
                <img 
                  src={selectedMovie.banner} 
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/1200x600/18181b/3f3f46?text=' + encodeURIComponent(selectedMovie.title);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                
                <div className="absolute bottom-12 left-10 md:left-14 flex items-end gap-12">
                   <img src={selectedMovie.poster} className="hidden md:block w-52 aspect-[2/3] object-cover rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 translate-y-24" onError={(e) => {
                     const target = e.target as HTMLImageElement;
                     target.src = 'https://placehold.co/400x600/18181b/3f3f46?text=' + encodeURIComponent(selectedMovie.title);
                   }} />
                   <div className="mb-6">
                     <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase italic leading-none">{selectedMovie.title}</h2>
                     <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                        <span className="px-3 py-1 border border-zinc-800 rounded-lg text-white">{selectedMovie.rating}</span>
                        <span>{selectedMovie.duration}</span>
                        <span className="text-blue-500 flex items-center gap-2"><Star className="w-4 h-4 fill-current" /> {selectedMovie.popularity}% Approval</span>
                     </div>
                   </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-[1fr_380px] gap-16 p-12 md:p-20 md:pt-36">
                <div className="space-y-16">
                  <section>
                    <h3 className="text-[10px] uppercase font-black tracking-[0.4em] text-zinc-600 mb-8">Narrative Arc</h3>
                    <p className="text-zinc-400 text-2xl leading-relaxed font-medium italic opacity-90 tracking-tight">{selectedMovie.description}</p>
                  </section>

                  <section>
                     <div className="bg-white/5 rounded-[3rem] p-12 border border-white/5 relative overflow-hidden group/showtimes">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -z-10 group-hover/showtimes:bg-blue-500/10 transition-all duration-700" />
                        <h3 className="text-[10px] uppercase font-black tracking-[0.4em] text-zinc-600 mb-10">Select Screening Time</h3>
                        <div className="flex flex-wrap gap-5">
                          {currentMovieShowtimes.map(st => {
                            const theater = THEATERS.find(t => t.id === st.theaterId);
                            if (!theater) return null;
                            return (
                              <button 
                                key={st.id}
                                onClick={() => startSeatSelection(theater, st)}
                                className="flex flex-col items-center justify-center min-w-[140px] py-8 bg-black/40 hover:bg-blue-600 border border-white/5 hover:border-blue-400 rounded-[2rem] transition-all shadow-2xl active:scale-95 group/time"
                              >
                                <span className="text-3xl font-black tracking-tighter group-hover/time:scale-110 transition-transform italic mb-1">{st.time}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 group-hover/time:text-blue-100">{st.format}</span>
                              </button>
                            );
                          })}
                        </div>
                     </div>
                  </section>
                </div>

                <div className="space-y-14">
                   <div>
                     <h3 className="text-[10px] uppercase font-black tracking-[0.4em] text-zinc-600 mb-6">Director</h3>
                     <p className="font-black text-white text-xl uppercase tracking-tighter italic">{selectedMovie.director}</p>
                   </div>
                   <div>
                     <h3 className="text-[10px] uppercase font-black tracking-[0.4em] text-zinc-600 mb-8">Lead Casting</h3>
                     <ul className="space-y-4">
                       {selectedMovie.cast.map(c => (
                         <li key={c} className="font-bold text-zinc-400 text-lg hover:text-blue-500 transition-colors cursor-default flex items-center gap-4">
                           <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                           {c}
                         </li>
                       ))}
                     </ul>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <GeminiAssistant />

      <footer className="bg-zinc-950 border-t border-white/5 mt-32 py-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-5 gap-16">
          <div className="col-span-1 md:col-span-2">
             <h2 className="text-3xl font-black tracking-tighter text-blue-500 mb-8 flex items-center gap-3">
               <Ticket className="w-8 h-8" />
               <span>CINE<span className="text-white">NYC</span></span>
             </h2>
             <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-xs mb-8">
               Curating the finest cinematic architecture and experiences across New York City. 
             </p>
          </div>
          <div>
            <h4 className="text-[10px] uppercase font-black tracking-[0.3em] mb-10 text-white">Guest Matrix</h4>
            <ul className="space-y-5 text-[11px] font-black uppercase tracking-widest text-zinc-600">
              <li><a href="#" className="hover:text-blue-500 transition-colors">Membership</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Private Events</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Gift Cards</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] uppercase font-black tracking-[0.3em] mb-10 text-white">Concierge</h4>
            <ul className="space-y-5 text-[11px] font-black uppercase tracking-widest text-zinc-600">
              <li><a href="#" className="hover:text-blue-500 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Accessibility</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Terms</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] uppercase font-black tracking-[0.3em] mb-10 text-white">Legal</h4>
            <ul className="space-y-5 text-[11px] font-black uppercase tracking-widest text-zinc-600">
              <li><a href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Ticket Terms</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Refunds</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-24 pt-12 border-t border-white/5 text-center md:text-left">
          <p className="text-[9px] text-zinc-800 font-black uppercase tracking-[0.4em]">© 2026 CineNYC Global Cinema Group. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
