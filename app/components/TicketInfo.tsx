import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { ticketSchema } from '@/lib/validations/ticket-schema';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const TicketInfo = () => {
  const form = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      name: '',
      age: undefined,
    },
  });

  function onSubmit(_data: z.infer<typeof ticketSchema>) {
    form.reset();
    alert('Ticket booked successfully!');
  }

  const eventType = 'FREE';
  return (
    <section className='border-1 lg:w-3/5 border-[#E9E9E9] rounded-md p-4'>
      <h1 className='text-2xl mb-8 font-semibold text-[#1F1F1F] pb-4 border-b-1 border-[#E9E9E9]'>
        Ticket Info
      </h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-6 mt-6'
        >
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-[#7D7D7D] font-medium pb-1'>
                  Enter your name
                </FormLabel>
                <FormControl>
                  <Input
                    // icon={<Mail className='h-4 w-4 ' />}
                    placeholder='E.g John Doe'
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='age'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-[#7D7D7D] font-medium pb-1'>
                  Your age
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='E.g 18'
                    type='number'
                    value={field.value === undefined ? '' : field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ''
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <footer className='space-y-6 mt-8'>
            <div className='rounded-full py-3 px-5 flex items-center gap-3 bg-[#F2FFF2]'>
              <Image
                src='/warning.svg'
                alt='warning'
                height={13.92}
                width={13.92}
              />

              <p className='font-medium text-xs text-[#0ABA2A]'>
                Secure and instant payment
              </p>
            </div>

            <Button
              size='lg'
              icon={
                <Image
                  src='/security-password.svg'
                  alt='secure password'
                  height={21.24}
                  width={21.24}
                />
              }
              className='rounded-full w-full'
            >
              {eventType === 'FREE'
                ? 'Verify & Attend'
                : 'Connect wallet to purchase'}
            </Button>
          </footer>
        </form>
      </Form>
    </section>
  );
};

export default TicketInfo;
