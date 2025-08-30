import UploadImgLogo from './assets/UploadImageLogo.png';
import './css/uploadImg.css';
import { useState } from 'react';

function UploadImg({ onUploadSuccess }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(''); // '', 'success', 'error'
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [similarProducts, setSimilarProducts] = useState([]);
    const [uploadResult, setUploadResult] = useState(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleFileSelect = (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setUploadStatus('error');
            setTimeout(() => setUploadStatus(''), 3000);
            return;
        }

        setSelectedFile(file);
        setUploadStatus('success');
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setUploadStatus('');
        setIsLoading(false);
        setImageUrl('');
        setSimilarProducts([]);
        setUploadResult(null);
        
        // Clear the file input
        const fileInput = document.querySelector('.upload');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleUrlChange = (e) => {
        setImageUrl(e.target.value);
    };

    const handleUrlSubmit = async (e) => {
        if (e.key === 'Enter' && imageUrl.trim()) {
            setIsLoading(true);
            setUploadStatus('');
            
            try {
                // Validate if URL is an image
                const response = await fetch(imageUrl, { method: 'HEAD' });
                const contentType = response.headers.get('content-type');
                
                if (!contentType || !contentType.startsWith('image/')) {
                    throw new Error('Invalid image URL');
                }
                
                // Create a mock file object for URL images
                const mockFile = {
                    name: imageUrl.split('/').pop() || 'image-from-url',
                    size: parseInt(response.headers.get('content-length')) || 0,
                    type: contentType,
                    url: imageUrl
                };
                
                setSelectedFile(mockFile);
                setUploadStatus('success');
            } catch (error) {
                setUploadStatus('error');
                setTimeout(() => setUploadStatus(''), 3000);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSubmit = async () => {
        if (!selectedFile && !imageUrl.trim()) return;
        
        setIsLoading(true);
        setUploadStatus('');
        
        try {
            const formData = new FormData();
            
            if (selectedFile && !selectedFile.url) {
                // File upload
                formData.append('image', selectedFile);
            } else {
                // URL upload
                formData.append('imageUrl', imageUrl);
            }
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Upload successful:', result);
                
                setUploadResult(result);
                setSimilarProducts(result.similarProducts || []);
                setUploadStatus('success');
                
                // Call parent component callback if provided
                if (onUploadSuccess) {
                    onUploadSuccess(result);
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div 
                className={`Upload-Section ${isDragOver ? 'drag-over' : ''} ${uploadStatus ? `upload-${uploadStatus}` : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <img src={UploadImgLogo} alt="Upload" />
                
                <div className="upload-input-container">
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="upload"
                        onChange={handleFileChange}
                        disabled={isLoading}
                    />
                    <div className="upload-button">
                        {isLoading && <div className="loading-spinner"></div>}
                        <div className="upload-text">
                            {isLoading ? 'Processing...' : 'Choose Image or Drag & Drop'}
                        </div>
                        <div className="upload-subtext">
                            {isLoading ? 'Please wait' : 'PNG, JPG, GIF up to 10MB'}
                        </div>
                    </div>
                </div>

                {selectedFile && (uploadStatus === 'success' || uploadStatus === '') && (
                    <div className="file-info">
                        <div className="file-details">
                            <div className="file-name">✓ {selectedFile.name}</div>
                            <div className="file-size">{formatFileSize(selectedFile.size)}</div>
                        </div>
                        <button 
                            className="remove-file-btn"
                            onClick={handleRemoveFile}
                            title="Remove file"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {uploadStatus === 'error' && (
                    <div className="file-info" style={{borderLeftColor: '#dc3545', backgroundColor: 'rgba(220, 53, 69, 0.1)'}}>
                        <div className="file-name" style={{color: '#dc3545'}}>✗ Please select a valid image file</div>
                    </div>
                )}
                
                <h1 className="or">OR</h1>
                
                <input 
                    type="text" 
                    placeholder="Paste Image URL" 
                    className="url"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    onKeyDown={handleUrlSubmit}
                    disabled={isLoading}
                />

                <button 
                    className='submit-button'
                    onClick={handleSubmit}
                    disabled={(!selectedFile && !imageUrl.trim()) || isLoading}
                >
                    {isLoading ? 'Processing...' : 'Find Similar Products'}
                </button>
            </div>

            {/* Display results */}
            {uploadResult && similarProducts.length > 0 && (
                <div className="results-section">
                    <h2>Similar Products Found:</h2>
                    <div className="products-grid">
                        {similarProducts.map((product, index) => (
                            <div key={product._id || index} className="product-card">
                                <img src={product.imageUrl} alt={product.name} />
                                <h3>{product.name}</h3>
                                <p>{product.category}</p>
                                <span className="price">${product.price}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

export default UploadImg;