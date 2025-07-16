use crate::models::{QRCodeData, QRCodeRequest};

pub struct QRService;

impl QRService {
    pub fn generate_qr_code(request: QRCodeRequest) -> QRCodeData {
        let bitcoin_uri = request.to_bitcoin_uri();
        let qr_svg = Self::generate_qr_svg(&bitcoin_uri);
        
        QRCodeData::new(
            request.bitcoin_address,
            request.amount_satoshi,
            request.invoice_id,
            qr_svg,
        )
    }
    
    pub fn generate_qr_svg(data: &str) -> String {
        let size = 200;
        let grid_size = 25;
        let cell_size = size / grid_size;
        
        let mut svg = format!(
            r#"<svg xmlns="http://www.w3.org/2000/svg" width="{}" height="{}" viewBox="0 0 {} {}">"#,
            size, size, size, size
        );
        
        svg.push_str(&format!(
            r#"<rect width="{}" height="{}" fill="white"/>"#,
            size, size
        ));
        
        let pattern = Self::create_qr_pattern(data, grid_size);
        
        for y in 0..grid_size {
            for x in 0..grid_size {
                if pattern[y][x] {
                    svg.push_str(&format!(
                        r#"<rect x="{}" y="{}" width="{}" height="{}" fill="black"/>"#,
                        x * cell_size, y * cell_size, cell_size, cell_size
                    ));
                }
            }
        }
        
        svg.push_str("</svg>");
        svg
    }
    
    fn create_qr_pattern(data: &str, size: usize) -> Vec<Vec<bool>> {
        let mut pattern = vec![vec![false; size]; size];
        
        let hash = Self::simple_hash(data);
        
        for y in 0..size {
            for x in 0..size {
                let bit_index = (y * size + x) % 64;
                pattern[y][x] = (hash >> bit_index) & 1 == 1;
            }
        }
        
        Self::add_finder_patterns(&mut pattern, size);
        
        pattern
    }
    
    fn simple_hash(data: &str) -> u64 {
        let mut hash = 0u64;
        for byte in data.bytes() {
            hash = hash.wrapping_mul(31).wrapping_add(byte as u64);
        }
        hash
    }
    
    fn add_finder_patterns(pattern: &mut Vec<Vec<bool>>, size: usize) {
        let positions = [(0, 0), (0, size.saturating_sub(7)), (size.saturating_sub(7), 0)];
        
        for (start_y, start_x) in positions {
            for dy in 0..7 {
                for dx in 0..7 {
                    let y = start_y + dy;
                    let x = start_x + dx;
                    if y < size && x < size {
                        pattern[y][x] = Self::is_finder_pattern_dot(dy, dx);
                    }
                }
            }
        }
    }
    
    fn is_finder_pattern_dot(y: usize, x: usize) -> bool {
        (y == 0 || y == 6 || x == 0 || x == 6) || 
        (y >= 2 && y <= 4 && x >= 2 && x <= 4)
    }
}