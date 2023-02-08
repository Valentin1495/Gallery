import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BsCheckCircleFill } from 'react-icons/bs';
import { HiOutlineStar, HiShare } from 'react-icons/hi';
import { format } from 'date-fns';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import NotFound from './NotFound';
import { getCollection, getItemsPerPage } from '../api/collectionApi';
import ItemCard from '../components/ItemCard';
import { ColProps } from '../components/Home/Gallery';

export interface Item {
  itemId?: number;
  itemImageName: string;
  itemName: string;
  itemPrice: number;
  coinImage: string;
  coinName: string;
  collectionName: string;
}

interface Collection extends ColProps {
  bannerImgName: string;
  coinId: number;
  coinName: string;
  collectionId: number;
  collectionName: string;
  ownerCount: number;
  createdDate: string;
  description: string;
  lowestPrice: number;
  totalVolume: number;
  itemList: Item[];
  itemCount: number;
  ownerName: string;
}

export default function CollectionDetails() {
  const { id } = useParams();
  const { ref, inView } = useInView();
  //   const createColOpen = useAppSelector((state) => state.toast.createColOpen);
  //   setTimeout(() => dispatch(setCreateColOpen(false)), 5000);

  const { isLoading, error, data } = useQuery<Collection>({
    queryKey: ['onlyCollection'],
    queryFn: () => getCollection(id!),
  });

  const {
    data: items,
    error: err,
    fetchNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['itemsPerPage'],
    queryFn: ({ pageParam = 1 }) => getItemsPerPage(id!, pageParam),
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasNext ? pages.length + 1 : undefined,
  });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]);

  if (isLoading) return <p>Loading...</p>;

  if (error instanceof Error)
    return <p>An error has occurred: + {error.message}</p>;

  if (!data) return <NotFound />;

  return (
    <div>
      <section className='relative h-[400px]'>
        <img
          src={import.meta.env.VITE_IMAGE_URL + data.bannerImgName}
          alt='Collection banner'
          className='w-full h-full object-cover'
        />
        <img
          src={import.meta.env.VITE_IMAGE_URL + data.logoImgName}
          alt='Collection logo'
          className='object-cover absolute -bottom-3 border-[6px] shadow-lg border-white rounded-xl left-8 w-24 h-24 sm:w-32 sm:h-32 lg:w-44 lg:h-44'
        />
      </section>

      <section className='px-8 space-y-3 text-[#04111D]'>
        <div className='h-10 w-full' />
        <div className='flex justify-between items-center'>
          <h1 className='text-4xl font-bold'>{data?.collectionName}</h1>
          <div className='space-x-3 flex dark:text-black'>
            <button className='shadowBtn'>
              <HiOutlineStar className='h-6 w-6 ' />
            </button>
            <button className='shadowBtn'>
              <HiShare className='h-6 w-6' />
            </button>
          </div>
        </div>

        <h3 className='text-lg'>
          By <span className='font-semibold'>{data?.ownerName}</span>
        </h3>
        <div>
          <span className='text-lg'>
            Items <span className='font-semibold'>{data?.itemCount}</span>
          </span>
          <span className='font-bold'>{' · '}</span>
          <span className='text-lg'>
            Created{' '}
            <span className='font-semibold'>
              {format(new Date(data?.createdDate!), 'MMM yyyy')}
            </span>
          </span>
          <span className='font-bold'>{' · '}</span>
          <span className='text-lg'>
            Chain <span className='font-semibold'>{data?.coinName}</span>{' '}
          </span>
        </div>
        <p>{data?.description}</p>

        <div className='flex space-x-5'>
          <div className='text-center'>
            <div className='font-semibold text-2xl'>
              {data?.totalVolume + ' ' + data?.coinName}
            </div>
            <div className='text'>total volume</div>
          </div>
          <div className='text-center'>
            <div className='font-semibold text-2xl'>
              {data?.lowestPrice + ' ' + data?.coinName}
            </div>
            <div className='text'>floor price</div>
          </div>
          <div className='text-center'>
            <div className='font-semibold text-2xl'>{data?.ownerCount}</div>
            <div className='text'>owners</div>
          </div>
        </div>
      </section>

      {status === 'loading' ? (
        <p>Loading...</p>
      ) : status === 'error' && err instanceof Error ? (
        <span>Error: {err.message}</span>
      ) : (
        <section className='px-8 pt-8'>
          {items?.pages.map((page, idx) => (
            <article
              className='grid mb-5 grid-cols-1 md:grid-cols-3 gap-5 xl:grid-cols-5'
              key={idx}
            >
              {page.data.map((item: Item) => (
                <ItemCard
                  key={item.itemId}
                  itemImageName={item.itemImageName}
                  itemName={item.itemName}
                  itemPrice={item.itemPrice}
                  coinName={item.coinName}
                  coinImage={item.coinImage}
                  collectionName={item.collectionName}
                />
              ))}
            </article>
          ))}
          <p className='inline-block' ref={ref}>
            {isFetchingNextPage && 'Loading more...'}
          </p>
        </section>
      )}

      {/* <Notification open={createColOpen} setOpen={setCreateColOpen}>
          <p className="flex items-center gap-1 text-emerald-700">
            <span>
              <BsCheckCircleFill className="h-7 w-7" />
            </span>{' '}
            Created!
          </p>
        </Notification> */}
    </div>
  );
}