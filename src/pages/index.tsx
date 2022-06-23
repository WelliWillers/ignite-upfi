import { Button, Box, Flex, Spinner, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

interface ImageProps {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
}

interface GetImagesTypeResponse {
  after: string;
  data: ImageProps[];
}

export default function Home(): JSX.Element {

  async function getImages({ pageParam = null }): Promise<GetImagesTypeResponse>{
    const { data } = await api('/api/images', {
      params: {
        after: pageParam,
      }
    })

    return data
  }

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    'images', 
    getImages, 
    {
      getNextPageParam: lastPage => lastPage?.after || null,
    }
  );

  const formattedData = useMemo(() => {
    const formatted = data?.pages.flatMap(imageData => {
      return imageData.data.flat();
    });
    return formatted;
  }, [data]);

  if(isLoading){
    return (
      <Flex justify={"center"}>
        <Loading />
      </Flex>
    )
  }
  
  if(isError) {
    return (
      <Flex justify={"center"}>
        <Error />
      </Flex>
    )
  } 

  return (
    <>
      <Header />

      <Box maxW={1120} px={[10, 15, 20]} mx="auto" my={[10, 15, 20]}>
        <CardList cards={formattedData} />
        {
          hasNextPage && (
            <Button
              mt="4"
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
            >
                {
                  isFetchingNextPage
                    ? 'Carregando...'
                    : 'Carregar mais'
                }
            </Button>
          )
        }
      </Box>
    </>
  );
}
