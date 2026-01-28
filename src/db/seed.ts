import { db } from './index';
import { users } from './schema';
import { v4 as uuidv4 } from 'uuid';

const INITIAL_USERS = [
    { name: 'Diego', code: 'EMP001', pin: '1234' },
    { name: 'Maria', code: 'EMP002', pin: '5678' },
    { name: 'Juan', code: 'EMP003', pin: '0000' },
    { name: 'Ana', code: 'EMP004', pin: '4321' },
    { name: 'Carlos', code: 'EMP005', pin: '1111' },
    { name: 'Lucia', code: 'EMP006', pin: '2222' },
    { name: 'Pedro', code: 'EMP007', pin: '3333' },
    { name: 'Sofia', code: 'EMP008', pin: '4444' },
    { name: 'Miguel', code: 'EMP009', pin: '5555' },
    { name: 'Elena', code: 'EMP010', pin: '6666' },
    { name: 'Pablo', code: 'EMP011', pin: '7777' },
    { name: 'Laura', code: 'EMP012', pin: '8888' },
    { name: 'David', code: 'EMP013', pin: '9999' },
    { name: 'Carmen', code: 'EMP014', pin: '1212' },
    { name: 'Javier', code: 'EMP015', pin: '1313' },
];

async function seed() {
    console.log('Seeding users...');

    for (const user of INITIAL_USERS) {
        try {
            await db.insert(users).values({
                id: uuidv4(),
                code: user.code,
                pin: user.pin,
                name: user.name,
                role: 'user',
            }).onConflictDoNothing();
            console.log(`User ${user.name} added.`);
        } catch (e) {
            console.error(`Error adding ${user.name}:`, e);
        }
    }

    console.log('Seeding complete.');
}

seed().catch(console.error);
