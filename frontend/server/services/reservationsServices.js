const db =require('../database')

module.exports.makeReservation = async (pickup_date, pickup_time, reservation_status, leftover_id, reserved_quantity) => {
    try {
        // Check if the leftover has enough quantity available
        const [leftover] = await db.query('SELECT quantity, status FROM leftover WHERE leftover_id = ?', [leftover_id]);
        if (leftover.length === 0) {
            throw new Error('Leftover not found');
        }

        const availableQuantity = leftover[0].quantity;
        const currentStatus = leftover[0].status;

        if (availableQuantity < reserved_quantity) {
            throw new Error('Not enough quantity available');
        }

        // Calculate the remaining quantity after reservation
        const remainingQuantity = availableQuantity - reserved_quantity;

        // Update the quantity and status of the leftover
        let newStatus = currentStatus;
        if (remainingQuantity === 0) {
            newStatus = 2; // Update status to 2 if fully reserved
        }

        await db.query('UPDATE leftover SET quantity = ?, status = ? WHERE leftover_id = ?', [remainingQuantity, newStatus, leftover_id]);

        // Insert the reservation into the database
        await db.query('INSERT INTO reservation (pickup_date, pickup_time, reservation_status) VALUES (?, ?, ?)', [pickup_date, pickup_time, reservation_status]);

        // Get the ID of the last inserted reservation
        const [result] = await db.query('SELECT LAST_INSERT_ID() AS reservation_id');
        const reservation_id = result[0].reservation_id;

        // Insert the reserved item into the database
        await db.query('INSERT INTO reserveditem (reservation_id, leftover_id, reserved_quantity) VALUES (?, ?, ?)', [reservation_id, leftover_id, reserved_quantity]);
    } catch (error) {
        console.error('Error making reservation:', error);
        throw error;
    }
};