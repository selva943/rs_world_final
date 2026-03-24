-- Seed 5 Mock Offers for Surprise Factory

INSERT INTO offers (
    offer_name, 
    offer_description, 
    offer_type, 
    discount_type, 
    discount_value, 
    status, 
    priority, 
    discount_text, 
    redirect_slug, 
    media
) VALUES 
(
    'Valentine Magic Combo', 
    'A cinematic love story reveal plus a physical memory box. The perfect surprise for your special someone.', 
    'combo', 
    'percentage', 
    25, 
    TRUE, 
    10, 
    '25% OFF BUNDLE', 
    '/offers', 
    '["https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200"]'::jsonb
),
(
    'First Surprise Special', 
    'Get a flat discount on your very first surprise experience with us. Welcome to the magic factory!', 
    'festival', 
    'flat', 
    500, 
    TRUE, 
    8, 
    'FLAT ₹500 OFF', 
    '/offers', 
    '["https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=1200"]'::jsonb
),
(
    'Anniversary Cinematic Reveal', 
    'Transform your anniversary photos into a breathtaking AI-powered movie reveal.', 
    'festival', 
    'percentage', 
    15, 
    TRUE, 
    9, 
    '15% ANNIVERSARY SPECIAL', 
    '/offers', 
    '["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200"]'::jsonb
),
(
    'Birthday Mega Surprise', 
    'The ultimate birthday package including digital reveal, physical gift, and doorstep setup.', 
    'combo', 
    'flat', 
    1000, 
    TRUE, 
    7, 
    'SAVE ₹1000', 
    '/offers', 
    '["https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&q=80&w=1200"]'::jsonb
),
(
    'Weekend Flash Sale', 
    'Limited time 30% discount on all digital story reveals. Valid this weekend only!', 
    'festival', 
    'percentage', 
    30, 
    TRUE, 
    5, 
    '30% FLASH SALE', 
    '/offers', 
    '["https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=1200"]'::jsonb
);
