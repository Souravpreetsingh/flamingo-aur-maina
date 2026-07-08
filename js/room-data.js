var ROOMS = [
    {
        id: 1,
        name: 'Flamingo 1',
        slug: 'flamingo-1',
        description: 'Spacious duplex room for 4 persons with mountain views, private balcony, and modern amenities.',
        longDescription: [
            'Flamingo 1 is a beautifully designed duplex room offering ample space for up to 4 guests. Nestled in the heart of Jibhi with uninterrupted 360° mountain views, this room combines rustic charm with modern comfort.',
            'Enjoy your morning tea on the private balcony overlooking the apple orchard, curl up with a book by the heater in the evening, and sleep soundly under warm electric blankets. Every detail has been thoughtfully arranged to make you feel at home.'
        ],
        price: 6000,
        capacity: 4,
        type: 'Duplex',
        location: 'Jibhi, Himachal Pradesh',
        greenImages: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
            'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'
        ],
        winterImages: [
            'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'
        ],
        amenities: [
            { icon: 'wifi', text: 'High Speed WiFi' },
            { icon: 'local_fire_department', text: 'Heater' },
            { icon: 'bed', text: 'Electric Heating Blankets' },
            { icon: 'local_fire_department', text: 'Bonfire' },
            { icon: 'local_laundry_service', text: 'Laundry (On Demand)' },
            { icon: 'iron', text: 'Ironing (On Demand)' },
            { icon: 'directions_car', text: 'Cab Service (On Demand)' },
            { icon: 'luggage', text: 'Luggage Assistance (On Demand)' },
            { icon: 'hiking', text: 'Trek Guide (On Demand)' }
        ],
        rating: 4.9,
        reviews: 32,
        badge: 'Popular'
    },
    {
        id: 2,
        name: 'Flamingo 2',
        slug: 'flamingo-2',
        description: 'King attic room for 4 persons with warm wooden interiors and panoramic valley views.',
        longDescription: [
            'Flamingo 2 is our charming King Attic room designed for comfort and warmth. With its wooden ceilings and cozy ambiance, this room offers a truly mountain experience for up to 4 guests.',
            'Wake up to panoramic valley views, spend your days exploring the surrounding orchards and trails, and return to the warmth of your electric blanket and heater. The attached café serves comforting food made with care, just steps away.'
        ],
        price: 5000,
        capacity: 4,
        type: 'King Attic',
        location: 'Jibhi, Himachal Pradesh',
        greenImages: [
            'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'
        ],
        winterImages: [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
            'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80'
        ],
        amenities: [
            { icon: 'wifi', text: 'High Speed WiFi' },
            { icon: 'local_fire_department', text: 'Heater' },
            { icon: 'bed', text: 'Electric Heating Blankets' },
            { icon: 'local_fire_department', text: 'Bonfire' },
            { icon: 'local_laundry_service', text: 'Laundry (On Demand)' },
            { icon: 'iron', text: 'Ironing (On Demand)' },
            { icon: 'directions_car', text: 'Cab Service (On Demand)' },
            { icon: 'luggage', text: 'Luggage Assistance (On Demand)' },
            { icon: 'hiking', text: 'Trek Guide (On Demand)' }
        ],
        rating: 4.85,
        reviews: 28,
        badge: null
    },
    {
        id: 3,
        name: 'Flamingo 3',
        slug: 'flamingo-3',
        description: 'Duplex room for 4 persons set in a serene apple orchard with stunning mountain views.',
        longDescription: [
            'Flamingo 3 is our premium duplex room offering the perfect mountain retreat for up to 4 guests. Surrounded by the apple orchard with 360° mountain views, this room is designed for those seeking peace and rejuvenation.',
            'Our founders, Karanvir Singh Sapra and Rahul Yadav, designed every corner to slow you down. Whether you are escaping the city, working remotely, or celebrating something special, this room provides the perfect sanctuary.'
        ],
        price: 6000,
        capacity: 4,
        type: 'Duplex',
        location: 'Jibhi, Himachal Pradesh',
        greenImages: [
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
            'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80'
        ],
        winterImages: [
            'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80'
        ],
        amenities: [
            { icon: 'wifi', text: 'High Speed WiFi' },
            { icon: 'local_fire_department', text: 'Heater' },
            { icon: 'bed', text: 'Electric Heating Blankets' },
            { icon: 'local_fire_department', text: 'Bonfire' },
            { icon: 'local_laundry_service', text: 'Laundry (On Demand)' },
            { icon: 'iron', text: 'Ironing (On Demand)' },
            { icon: 'directions_car', text: 'Cab Service (On Demand)' },
            { icon: 'luggage', text: 'Luggage Assistance (On Demand)' },
            { icon: 'hiking', text: 'Trek Guide (On Demand)' }
        ],
        rating: 4.92,
        reviews: 18,
        badge: 'Premium'
    },
    {
        id: 4,
        name: 'Maina 1',
        slug: 'maina-1',
        description: 'Cozy private room for 2 persons with warm wooden interiors and mountain charm.',
        longDescription: [
            'Maina 1 is a cozy private room perfect for couples or solo travelers seeking a quiet mountain escape. Thoughtfully designed with warm wooden interiors, this room offers all the comforts you need for a relaxing stay.',
            'Spend your mornings on the 1.5 acres of open land, enjoy conversations over countless cups of tea at our café, and end your day under the stars with a bonfire. At FAM, every guest is welcomed like an old friend.'
        ],
        price: 2500,
        capacity: 2,
        type: 'Private Room',
        location: 'Jibhi, Himachal Pradesh',
        greenImages: [
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
            'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80'
        ],
        winterImages: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
            'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80'
        ],
        amenities: [
            { icon: 'wifi', text: 'High Speed WiFi' },
            { icon: 'local_fire_department', text: 'Heater' },
            { icon: 'bed', text: 'Electric Heating Blankets' },
            { icon: 'local_fire_department', text: 'Bonfire' },
            { icon: 'local_laundry_service', text: 'Laundry (On Demand)' },
            { icon: 'iron', text: 'Ironing (On Demand)' },
            { icon: 'directions_car', text: 'Cab Service (On Demand)' },
            { icon: 'luggage', text: 'Luggage Assistance (On Demand)' },
            { icon: 'hiking', text: 'Trek Guide (On Demand)' }
        ],
        rating: 4.8,
        reviews: 24,
        badge: null
    },
    {
        id: 5,
        name: 'Maina 2',
        slug: 'maina-2',
        description: 'Budget-friendly private room for 2 persons with essential comforts and mountain access.',
        longDescription: [
            'Maina 2 offers a comfortable and affordable stay for couples or solo travelers. Despite its budget-friendly price, you get full access to all of FAM\'s amenities including the café, bonfire, and 1.5 acres of open land.',
            'Whether you are working remotely or exploring the trails of Jibhi, this room provides a cozy basecamp. Our staff is always available to help with cab bookings, trek guides, and luggage assistance on demand.'
        ],
        price: 2000,
        capacity: 2,
        type: 'Private Room',
        location: 'Jibhi, Himachal Pradesh',
        greenImages: [
            'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'
        ],
        winterImages: [
            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
            'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80'
        ],
        amenities: [
            { icon: 'wifi', text: 'High Speed WiFi' },
            { icon: 'local_fire_department', text: 'Heater' },
            { icon: 'bed', text: 'Electric Heating Blankets' },
            { icon: 'local_fire_department', text: 'Bonfire' },
            { icon: 'local_laundry_service', text: 'Laundry (On Demand)' },
            { icon: 'iron', text: 'Ironing (On Demand)' },
            { icon: 'directions_car', text: 'Cab Service (On Demand)' },
            { icon: 'luggage', text: 'Luggage Assistance (On Demand)' },
            { icon: 'hiking', text: 'Trek Guide (On Demand)' }
        ],
        rating: 4.75,
        reviews: 36,
        badge: 'Best Value'
    },
    {
        id: 6,
        name: 'Maina 3',
        slug: 'maina-3',
        description: 'Charming private room for 2 persons with orchard views and warm hospitality.',
        longDescription: [
            'Maina 3 is a charming private room offering comfort and warmth for couples or solo travelers. With views of the apple orchard and easy access to all property amenities, it is the perfect retreat for those seeking peace.',
            'At FAM, we are not just hosting guests. We are building a place people can belong to. Enjoy bonfire evenings, trekking adventures, and the kind of hospitality that makes you want to come back.'
        ],
        price: 2500,
        capacity: 2,
        type: 'Private Room',
        location: 'Jibhi, Himachal Pradesh',
        greenImages: [
            'https://images.unsplash.com/photo-1598928506311-c55ez637a11a?w=800&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'
        ],
        winterImages: [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
            'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80'
        ],
        amenities: [
            { icon: 'wifi', text: 'High Speed WiFi' },
            { icon: 'local_fire_department', text: 'Heater' },
            { icon: 'bed', text: 'Electric Heating Blankets' },
            { icon: 'local_fire_department', text: 'Bonfire' },
            { icon: 'local_laundry_service', text: 'Laundry (On Demand)' },
            { icon: 'iron', text: 'Ironing (On Demand)' },
            { icon: 'directions_car', text: 'Cab Service (On Demand)' },
            { icon: 'luggage', text: 'Luggage Assistance (On Demand)' },
            { icon: 'hiking', text: 'Trek Guide (On Demand)' }
        ],
        rating: 4.82,
        reviews: 21,
        badge: null
    }
];

var ROOM_BOOKING_IMAGES = {
    1: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    2: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
    3: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    4: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    5: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
    6: 'https://images.unsplash.com/photo-1598928506311-c55ez637a11a?w=800&q=80'
};

var ROOM_BOOKING_WINTER = {
    1: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
    2: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    3: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
    4: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    5: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
    6: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'
};

function getRoomById(id) {
    return ROOMS.find(function(r) { return r.id == id; }) || null;
}

function getRoomImages(room) {
    var isWinter = document.documentElement.classList.contains('winter');
    return isWinter ? (room.winterImages || room.greenImages) : room.greenImages;
}

function getRoomBookingImage(roomId) {
    var isWinter = document.documentElement.classList.contains('winter');
    if (isWinter && ROOM_BOOKING_WINTER[roomId]) return ROOM_BOOKING_WINTER[roomId];
    return ROOM_BOOKING_IMAGES[roomId] || '';
}
