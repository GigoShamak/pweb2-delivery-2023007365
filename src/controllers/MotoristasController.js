// Traduz HTTP <-> service. Sem regra de negócio.
export class MotoristasController {
  constructor(service) {
    this.service = service;
  }

  criar = async (req, res) => {
    res.status(201).json(await this.service.criar(req.body));
  };

  listar = async (req, res) => {
    res.status(200).json(await this.service.listar());
  };

  buscarPorId = async (req, res) => {
    res.status(200).json(await this.service.buscarPorId(req.params.id));
  };

  listarEntregas = async (req, res) => {
    res.status(200).json(await this.service.listarEntregas(req.params.id, req.query));
  };
}
