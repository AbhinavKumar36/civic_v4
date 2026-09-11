import { Schema, model, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  actorId?: Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  actorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: String },
  metadata: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now, index: true },
});

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
