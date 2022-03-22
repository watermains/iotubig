export class Stats {
  constructor(params: {
    idle?: number;
    open?: number;
    close?: number;
    fault?: number;
    pending_open?: number;
    pending_close?: number;
  }) {
    this.idle = params.idle || 0;
    this.open = params.open || 0;
    this.close = params.close || 0;
    this.fault = params.fault || 0;
    this.pending_open = params.pending_open || 0;
    this.pending_close = params.pending_close || 0;
  }

  idle: number;
  open: number;
  close: number;
  fault: number;
  pending_open: number;
  pending_close: number;
}
