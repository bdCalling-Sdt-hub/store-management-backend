import mongoose, { Schema } from 'mongoose';
import { INormalUser } from './normalUser.interface';

const NormalUserSchema = new mongoose.Schema<INormalUser>({
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    isAgeOver22: {
        type: Boolean,
    },
});

NormalUserSchema.index({ store: 1, email: 1 }, { unique: true });

NormalUserSchema.index({ store: 1, phone: 1 }, { unique: true });

export const NormalUser = mongoose.model('NormalUser', NormalUserSchema);
