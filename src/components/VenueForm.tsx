'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const AMENITIES = ['Projector','Microphone','Wifi','Parking','Catering','Wheelchair','Outdoor','Kitchen','Stage'] as const;
type Amenity = typeof AMENITIES[number];

interface VenueFormProps {
  venue?: {
    _id: Id<'venues'>;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    capacity: number;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    amenities: Amenity[];
    notes?: string;
  };
}

export function VenueForm({ venue }: VenueFormProps) {
  const router = useRouter();
  const createVenue = useMutation(api.venues.create);
  const updateVenue = useMutation(api.venues.update);

  const [name, setName] = useState(venue?.name ?? '');
  const [address, setAddress] = useState(venue?.address ?? '');
  const [city, setCity] = useState(venue?.city ?? '');
  const [state, setState] = useState(venue?.state ?? '');
  const [zip, setZip] = useState(venue?.zip ?? '');
  const [capacity, setCapacity] = useState(venue?.capacity?.toString() ?? '');
  const [contactName, setContactName] = useState(venue?.contactName ?? '');
  const [contactEmail, setContactEmail] = useState(venue?.contactEmail ?? '');
  const [contactPhone, setContactPhone] = useState(venue?.contactPhone ?? '');
  const [amenities, setAmenities] = useState<Amenity[]>(venue?.amenities ?? []);
  const [notes, setNotes] = useState(venue?.notes ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleAmenity(a: Amenity) {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name, address, city, state, zip,
        capacity: parseInt(capacity),
        contactName: contactName || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        amenities,
        notes: notes || undefined,
      };
      if (venue) {
        await updateVenue({ id: venue._id, ...payload });
      } else {
        await createVenue(payload);
      }
      router.push('/venues');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="space-y-1">
        <Label htmlFor="name">Venue Name *</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="address">Street Address *</Label>
        <Input id="address" value={address} onChange={e => setAddress(e.target.value)} required />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1 col-span-1">
          <Label htmlFor="city">City *</Label>
          <Input id="city" value={city} onChange={e => setCity(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="state">State *</Label>
          <Input id="state" value={state} onChange={e => setState(e.target.value)} maxLength={2} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="zip">ZIP *</Label>
          <Input id="zip" value={zip} onChange={e => setZip(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="capacity">Capacity *</Label>
        <Input id="capacity" type="number" value={capacity} onChange={e => setCapacity(e.target.value)} min={1} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="contactName">Contact Name</Label>
          <Input id="contactName" value={contactName} onChange={e => setContactName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input id="contactEmail" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="contactPhone">Contact Phone</Label>
        <Input id="contactPhone" type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Amenities</Label>
        <div className="grid grid-cols-3 gap-2">
          {AMENITIES.map(a => (
            <label key={a} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={amenities.includes(a)}
                onCheckedChange={() => toggleAmenity(a)}
              />
              {a}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : venue ? 'Update Venue' : 'Add Venue'}
      </Button>
    </form>
  );
}