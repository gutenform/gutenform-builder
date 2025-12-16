import { useRouteError } from "react-router-dom";
import { __ } from "@/lib/i18n";

const Error = () => {
  const error: any = useRouteError();
  return (
    <div className="flex flex-col items-center justify-center lg:fixed w-full h-full">
      <h1>{__('oops')}</h1>
      <p>{__('unexpectedError')}</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
};

export default Error;
