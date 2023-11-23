import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './Button'; 
import { Modal } from './Modal'; 
import { Searchbar } from './Searchbar'; 
import { ImageGallery } from './ImageGallery'; 
import { ImageGalleryItem } from './ImageGalleryItem';
import { Bars } from 'react-loader-spinner';
import styled from 'styled-components';

const StyledApp = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 16px;
  padding-bottom: 24px;
`;

export const App = () => {

  const [query, setQuery] = useState('');
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [totalHits, setTotalHits] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    async function getImages() {
      try {
        setIsLoading(true);
        const initialImages = await fetchImages();
        setImages(initialImages);
      } catch (error) {
        console.error('Error fetching initial images:', error);
      } finally {
        setIsLoading(false);
      }
    }
    getImages()
  }, []);
  
useEffect(() => {
  if (query === '') {
    return;
  }
    fetchImages(); 
}, [query]);
  

  const fetchImages = async () => {
    
    const apiKey = '40677979-cd292d53039c37b7a3f8f64ae';

    try {
      setIsLoading(true);

      const response = await axios.get(`https://pixabay.com/api/`, {
        params: { key: apiKey, q: query, page: currentPage, per_page: 12 },
      });

      const newImages = response.data.hits;
      const totalMaxHits = response.data.totalHits
      setImages(prevState => [...prevState, ...newImages]);
      setTotalHits(totalMaxHits);
      
      return newImages;
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (newQuery) => {
    setQuery(newQuery);
    setImages([]);
    setCurrentPage(1);
  };

  const loadMore = () => {
    setCurrentPage(prevState => prevState + 1);
  };

  const openModal = (image) => {
    if (!isModalOpen) {
      setSelectedImage(image);
      setIsModalOpen(true);
      document.addEventListener('keydown', handleKeyDown);
    }
  };

  const closeModal = () => {
    if (isModalOpen) {
      setSelectedImage(null);
      setIsModalOpen(false);
      document.removeEventListener('keydown', handleKeyDown);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  
    

  return (
    <StyledApp className="App">
      <Searchbar onSubmit={handleSearch} />
      <ImageGallery images={images} onImageClick={openModal}>
        {images.map((image) => (
          <ImageGalleryItem key={image.id} id={image.id} src={image.webformatURL} alt={image.tags} onClick={() => openModal(image)} />
        ))}
      </ImageGallery>
      {isLoading && <Bars type="Oval" color="#00BFFF" height={100} width={100} timeout={3000} />}
      {images.length > 0 && !isLoading && totalHits > images.length && <Button onLoadMore={loadMore} show={true} />}
      {selectedImage && (
        <Modal
          image={selectedImage.largeImageURL}
          onClose={closeModal}
        />
      )}
    </StyledApp>
  );
}
