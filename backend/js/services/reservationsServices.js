const db =require('../database')

module.exports.getRestaurantIdByAccountId = async (accountId) => {
    try {
        // Query the database to get the restaurant ID associated with the account ID
        const [restaurantIdResult] = await db.query(`
            SELECT restaurant_id
            FROM restaurant
            WHERE account_id = ?;
        `, [accountId]);

        // Check if a restaurant ID was found
        if (!restaurantIdResult || restaurantIdResult.length === 0) {
            throw new Error('Restaurant not found for the provided account ID');
        }

        return restaurantIdResult[0].restaurant_id;
    } catch (error) {
        console.error('Error fetching restaurant ID:', error);
        throw error;
    }
};
module.exports.getOrganizationIdByAccountId = async (accountId) => {
    try {
        // Query the database to get the restaurant ID associated with the account ID
        const [OrganizationIdResult] = await db.query(`
            SELECT organization_id
            FROM organization
            WHERE account_id = ?;
        `, [accountId]);

        // Check if a restaurant ID was found
        if (!OrganizationIdResult || !OrganizationIdResult.length === 0) {
            throw new Error('organization not found for the provided account ID');
        }
        return OrganizationIdResult[0].organization_id;
    } catch (error) {
        console.error('Error fetching restaurant ID:', error);
        throw error;
    }
};

module.exports.getReservationsForRestaurant = async (restaurantId) => {
    try {
        const query = `
            SELECT
                DATE_FORMAT(r.pickup_date, '%Y-%m-%d') AS pickup_date,
                r.pickup_time,
                r.reservation_status,
                a.user_name AS organization_username,
                l.type AS leftover_type,
                l.name AS leftover_name,
                ri.reserved_quantity AS leftover_quantity
            FROM
                reservation r
                INNER JOIN organization o ON r.organization_id = o.organization_id
                INNER JOIN account a ON o.account_id = a.account_id
                INNER JOIN reserveditem ri ON r.reservation_id = ri.reservation_id
                INNER JOIN leftover l ON ri.leftover_id = l.leftover_id
            WHERE
                r.restaurant_id = ?;
        `;
        const [reservations] = await db.query(query, [restaurantId]);

        // Group reservations by pickup date and time
        const groupedReservations = {};
        reservations.forEach(reservation => {
            const { pickup_date, pickup_time, reservation_status, organization_username, leftover_type, leftover_name, leftover_quantity } = reservation;
            const reservationKey = `${pickup_date}-${pickup_time}`;
            if (!groupedReservations[reservationKey]) {
                groupedReservations[reservationKey] = {
                    pickupdate: pickup_date,
                    pickuptime: pickup_time,
                    reservation_status,
                    organization_username,
                    leftovers: []
                };
            }
            groupedReservations[reservationKey].leftovers.push({
                leftover_type,
                leftover_name,
                leftover_quantity
            });
        });

        // Convert the grouped reservations object to an array
        const formattedReservations = Object.values(groupedReservations);
        return formattedReservations;
    } catch (error) {
        console.error('Error fetching reservations for restaurant:', error);
        throw error;
    }
};


module.exports.getOrganizationReservations = async (organizationId) => {
    try {
        const query = `
        SELECT
            DATE_FORMAT(r.pickup_date, '%Y-%m-%d') AS pickup_date,
            r.pickup_time,
            MAX(r.reservation_status) AS reservation_status,
            l.type AS leftover_type,
            l.name AS leftover_name,
            SUM(ri.reserved_quantity) AS leftover_quantity,
            a_restaurant.user_name AS restaurant_username,
            r_restaurant.address AS restaurant_address,
            r_restaurant.city AS restaurant_city
        FROM
            reservation r
            INNER JOIN organization o ON r.organization_id = o.organization_id
            INNER JOIN account a ON o.account_id = a.account_id
            INNER JOIN reserveditem ri ON r.reservation_id = ri.reservation_id
            INNER JOIN leftover l ON ri.leftover_id = l.leftover_id
            INNER JOIN restaurant r_restaurant ON r.restaurant_id = r_restaurant.restaurant_id
            INNER JOIN account a_restaurant ON r_restaurant.account_id = a_restaurant.account_id
        WHERE
            o.organization_id = ?
        GROUP BY
            r.pickup_date,
            r.pickup_time,
            a_restaurant.user_name,
            r_restaurant.address,
            r_restaurant.city,
            l.type,
            l.name;
    `;
        const [reservations] = await db.query(query, [organizationId]);

        // Group reservations by pickup date and time
        const groupedReservations = {};
        reservations.forEach(reservation => {
            const { pickup_date, pickup_time, reservation_status, leftover_type, leftover_name, leftover_quantity, restaurant_username,restaurant_address,restaurant_city} = reservation;
            const reservationKey = `${pickup_date}-${pickup_time}`;
            if (!groupedReservations[reservationKey]) {
                groupedReservations[reservationKey] = {
                    pickupdate: pickup_date,
                    pickuptime: pickup_time,
                    reservation_status,
                    restaurant_username,
                    leftovers: [],
                    restaurant_address,
                    restaurant_city
                };
            }
            groupedReservations[reservationKey].leftovers.push({
                leftover_type,
                leftover_name,
                leftover_quantity
            });
        });

        // Convert the grouped reservations object to an array
        const formattedReservations = Object.values(groupedReservations);
        return formattedReservations;
    } catch (error) {
        console.error('Error fetching organization reservations:', error);
        throw error;
    }
};

// module.exports.getOrganizationReservations = async (organizationId) => {
//     try {
//         const query = `
//         SELECT
//             DATE_FORMAT(r.pickup_date, '%Y-%m-%d') AS pickup_date,
//             r.pickup_time,
//             MAX(r.reservation_status) AS reservation_status,
//             l.type AS leftover_type,
//             l.name AS leftover_name,
//             SUM(ri.reserved_quantity) AS leftover_quantity,
//             a_restaurant.user_name AS restaurant_username
//         FROM
//             reservation r
//             INNER JOIN organization o ON r.organization_id = o.organization_id
//             INNER JOIN account a ON o.account_id = a.account_id
//             INNER JOIN reserveditem ri ON r.reservation_id = ri.reservation_id
//             INNER JOIN leftover l ON ri.leftover_id = l.leftover_id
//             INNER JOIN restaurant r_restaurant ON r.restaurant_id = r_restaurant.restaurant_id
//             INNER JOIN account a_restaurant ON r_restaurant.account_id = a_restaurant.account_id
//         WHERE
//             o.organization_id = ?
//         GROUP BY
//             r.pickup_date,
//             r.pickup_time,
//             a_restaurant.user_name,
//             l.type,
//             l.name;
//     ;`
//         const [reservations] = await db.query(query, [organizationId]);

//         // Group reservations by pickup date and time
//         const groupedReservations = {};
//         reservations.forEach(reservation => {
//             const { pickup_date, pickup_time, reservation_status, leftover_type, leftover_name, leftover_quantity, restaurant_username } = reservation;
//             const reservationKey = `${pickup_date}-${pickup_time}`;
//             if (!groupedReservations[reservationKey]) {
//                 groupedReservations[reservationKey] = {
//                     pickupdate: pickup_date,
//                     pickuptime: pickup_time,
//                     reservation_status,
//                     restaurant_username,
//                     leftovers: []
//                 };
//             }
//             groupedReservations[reservationKey].leftovers.push({
//                 leftover_type,
//                 leftover_name,
//                 leftover_quantity
//             });
//         });

//         // Convert the grouped reservations object to an array
//         const formattedReservations = Object.values(groupedReservations);
//         return formattedReservations;
//     } catch (error) {
//         console.error('Error fetching organization reservations:', error);
//         throw error;
//     }
// };
/*module.exports.makeReservation = async (pickup_date, pickup_time, reservation_status, leftover_id, reserved_quantity) => {
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
};*/