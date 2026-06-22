import { FeedingRecord, CreateFeedingDTO } from '@/types/domain/feeding.schema';

export interface IFeedingRepository {
  getByAnimal(animalId: string): Promise<FeedingRecord[]>;

  /** Registra alimentación y descuenta stock (RPC fn_register_feeding). Devuelve id del feeding_record. */
  addFeeding(data: CreateFeedingDTO): Promise<string>;

  getFeedingSummaryByAnimal(animalId: string): Promise<unknown>;
}
