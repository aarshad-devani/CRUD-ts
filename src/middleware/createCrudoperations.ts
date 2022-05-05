import { Router, Response, Request } from "express";
import { knexInstance } from "../config/knex-config";
import { IPaginateParams, IWithPagination } from "knex-paginate";

const defaultPaginatedRequest: IPaginateParams = { currentPage: 1, perPage: 10 };

export type IEventType = "created" | "udpated" | "deleted";

export type ICRUDInstanceOptions<T = any> = {
  tableName: string;
  identifier: keyof T;
  onEvent?: (eventType: IEventType, data: T | T[]) => void;
  addAuditFields?: boolean;
};

export const GetCRUDInstance = <T = any>(config: ICRUDInstanceOptions) => {
  const app = Router();

  app.post("/getAll", (req: Request, res: Response) => {
    const { paginationParams } = req.body;
    GetPaginatedData(paginationParams ?? defaultPaginatedRequest)
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((err) => {
        console.error("Error Making request\n", err);
        res.status(500).send({ message: err.message ?? "Error Making request" });
      });
  });

  app.post("/getOne", (req: Request, res: Response) => {
    const { requestParams } = req.body;
    GetOne(requestParams)
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((err) => {
        console.error("Error Making request\n", err);
        res.status(500).send({ message: err.message ?? "Error Making request" });
      });
  });

  app.post("/getPaginated", (req: Request, res: Response) => {
    const { paginationParams } = req.body;
    GetPaginatedData(paginationParams)
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((err) => {
        console.error("Error Making request\n", err);
        res.status(500).send({ message: err.message ?? "Error Making request" });
      });
  });

  app.post("/create", (req: Request, res: Response) => {
    const { data } = req.body;
    AddData(data)
      .then((resp) => {
        res.status(201).send(resp);
      })
      .catch((err) => {
        console.error("Error Making request\n", err);
        res.status(500).send({ message: err.message ?? "Error Making request" });
      });
  });

  app.put("/update", (req: Request, res: Response) => {
    const { data } = req.body;
    UpdateData(data)
      .then((resp) => {
        res.status(200).send(resp);
      })
      .catch((err) => {
        console.error("Error Making request\n", err);
        res.status(500).send({ message: err.message ?? "Error Making request" });
      });
  });

  app.delete("/delete", (req: Request, res: Response) => {
    const id = req.query[config.identifier as string];
    DeleteData(id)
      .then((resp) => {
        res.status(200).send({ deleted: resp });
      })
      .catch((err) => {
        console.error("Error Making request\n", err);
        res.status(500).send({ message: err.message ?? "Error Making request" });
      });
  });

  const GetPaginatedData = async (
    paginationRequest: IPaginateParams = defaultPaginatedRequest
  ): Promise<IWithPagination<T>> => {
    const toBeReturnedData = await knexInstance<T>(config.tableName).paginate({
      ...defaultPaginatedRequest,
      ...paginationRequest,
    });
    return toBeReturnedData as IWithPagination<T>;
  };

  const GetFilteredData = async (
    conditions: Partial<T>,
    paginationRequest: IPaginateParams = defaultPaginatedRequest
  ): Promise<Array<T>> => {
    const toBeReturnedData = await knexInstance<T>(config.tableName)
      .select("*")
      .where(conditions)
      .paginate({
        ...defaultPaginatedRequest,
        ...paginationRequest,
      });
    return toBeReturnedData.data as T[];
  };

  const GetOne = async (conditions: Partial<T>): Promise<T> => {
    const toBeReturnedData = await knexInstance<T>(config.tableName)
      .select("*")
      .where(conditions)
      .first();
    return toBeReturnedData as T;
  };

  const AddData = async (data: T | T[]): Promise<T[]> => {
    const insertionData: T[] = (Array.isArray(data) ? data : [data]).map((iteration: T) => {
      let dataToBeAdded: any = { ...iteration };
      delete dataToBeAdded[config.identifier];
      return dataToBeAdded;
    });

    const insertedData = (await knexInstance<T>(config.tableName)
      .returning("*")
      .insert(insertionData as any)) as T[];

    return insertedData;
  };

  const UpdateData = async (data: T): Promise<T> => {
    let dataToBeUpdated: any = { ...data };
    delete dataToBeUpdated[config.identifier];
    const updateData = await knexInstance<T>(config.tableName)
      .returning(config.identifier as string)
      .update(dataToBeUpdated);

    return dataToBeUpdated as T;
  };

  const DeleteData = async (value: any): Promise<boolean> => {
    try {
      await knexInstance<T>(config.tableName)
        .where({ [config.identifier as string]: value })
        .delete();
      return true;
    } catch (err) {
      return false;
    }
  };

  return {
    router: app,
    getPaginated: GetPaginatedData,
    getFilteredData: GetFilteredData,
    getData: GetOne,
    addData: AddData,
    updateData: UpdateData,
    deleteData: DeleteData,
  };
};
